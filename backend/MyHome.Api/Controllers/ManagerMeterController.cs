// Приёмка показаний счётчиков по домам. Период приёма - текущий календарный месяц.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
using MyHome.Infrastructure.Persistence;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/manager/meter")]
[Authorize(Roles = "Manager")]
public class ManagerMeterController : ControllerBase
{
    private readonly AppDbContext _db;
    public ManagerMeterController(AppDbContext db) => _db = db;

    // GET /summary — общая сводка по периоду
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        // всего квартир = сумма ApartmentsTotal по домам УК
        var apartmentsTotal = await _db.Buildings
            .Where(b => b.OrganizationId == orgId)
            .SumAsync(b => (int?)b.ApartmentsTotal) ?? 0;

        var deliveredApartments = await _db.MeterReadings
            .Where(m => m.CreatedAt >= monthStart && m.CreatedAt <= monthEnd && m.User.OrganizationId == orgId)
            .Select(m => m.UserId)
            .Distinct()
            .CountAsync();

        var pct = apartmentsTotal > 0
            ? (int)Math.Round((double)deliveredApartments / apartmentsTotal * 100)
            : 0;

        // Группировка по типу счётчика.
        var byType = await _db.MeterReadings
            .Where(m => m.CreatedAt >= monthStart && m.CreatedAt <= monthEnd && m.User.OrganizationId == orgId)
            .GroupBy(m => m.MeterType)
            .Select(g => new { type = g.Key, n = g.Select(x => x.UserId).Distinct().Count() })
            .ToListAsync();

        int Sum(Func<string, bool> match) =>
            byType.Where(b => match(b.type)).Sum(b => b.n);

        var meterTypes = new[]
        {
            new { code = "ColdWater",   label = "ХВС",   color = "#0ea5e9", n = Sum(t => t == "ColdWater"   || t.Contains("ХВ") || t.Contains("холод", StringComparison.OrdinalIgnoreCase)), t = apartmentsTotal },
            new { code = "HotWater",    label = "ГВС",   color = "#f59e0b", n = Sum(t => t == "HotWater"    || t.Contains("ГВ") || t.Contains("горяч", StringComparison.OrdinalIgnoreCase)), t = apartmentsTotal },
            new { code = "Electricity", label = "Эл-во", color = "#7c3aed", n = Sum(t => t == "Electricity" || t.Contains("электр", StringComparison.OrdinalIgnoreCase)), t = apartmentsTotal },
            new { code = "Gas",         label = "Газ",   color = "#334155", n = Sum(t => t == "Gas"         || t.Contains("газ", StringComparison.OrdinalIgnoreCase)), t = apartmentsTotal },
        };

        return Ok(new
        {
            periodLabel = $"1–{DateTime.DaysInMonth(now.Year, now.Month)} {RuMonth(now.Month)}",
            apartmentsTotal,
            delivered = deliveredApartments,
            pct,
            // в РФ обычно сдают до 25-го
            dueDay = 25,
            daysLeft = Math.Max(0, 25 - now.Day),
            meterTypes,
        });
    }

    // GET /houses — таблица домов с % сдачи
    [HttpGet("houses")]
    public async Task<IActionResult> GetHouses()
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        if (orgId == null) return Ok(Array.Empty<object>());

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var buildings = await _db.Buildings.AsNoTracking()
            .Where(b => b.OrganizationId == orgId)
            .ToListAsync();
        var residents = await _db.Users.AsNoTracking()
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && u.Street != null && u.House != null)
            .Select(u => new { u.Id, u.Street, u.House, u.Building })
            .ToListAsync();

        // Показания в этом месяце, сгруппированные по жильцу и типу счётчика.
        var readings = await _db.MeterReadings
            .Where(m => m.CreatedAt >= monthStart && m.User.OrganizationId == orgId)
            .Select(m => new { m.UserId, m.MeterType })
            .ToListAsync();

        var rows = buildings
            .OrderBy(b => b.Street).ThenBy(b => b.House).ThenBy(b => b.Block)
            .Select(b =>
            {
                var ids = residents
                    .Where(u => AddressMatches(u.Street, u.House, u.Building, b))
                    .Select(u => u.Id)
                    .ToHashSet();
                var done = readings.Where(r => ids.Contains(r.UserId))
                    .Select(r => r.UserId).Distinct().Count();
                var hot = readings.Count(r => ids.Contains(r.UserId)
                    && (r.MeterType == "HotWater" || r.MeterType.Contains("горяч", StringComparison.OrdinalIgnoreCase) || r.MeterType.Contains("ГВ")));
                var cold = readings.Count(r => ids.Contains(r.UserId)
                    && (r.MeterType == "ColdWater" || r.MeterType.Contains("холод", StringComparison.OrdinalIgnoreCase) || r.MeterType.Contains("ХВ")));
                var el = readings.Count(r => ids.Contains(r.UserId)
                    && (r.MeterType == "Electricity" || r.MeterType.Contains("электр", StringComparison.OrdinalIgnoreCase)));
                var pct = b.ApartmentsTotal > 0
                    ? (int)Math.Round((double)done / b.ApartmentsTotal * 100)
                    : 0;
                return new
                {
                    id = b.Id,
                    addr = FormatAddr(b),
                    apartments = b.ApartmentsTotal,
                    done,
                    hot, cold, el,
                    pct,
                    tone = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
                    flag = pct < 50 ? "риск" : pct < 80 ? "медленно" : null
                };
            });

        return Ok(rows);
    }

    // GET /recent?limit=20 — последние принятые показания
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 20)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var list = await _db.MeterReadings
            .AsNoTracking()
            .Where(m => m.User.OrganizationId == orgId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .Select(m => new
            {
                id = m.Id,
                createdAt = m.CreatedAt,
                meterType = m.MeterType,
                value = m.Value,
                fullName = m.User.FullName,
                avatarUrl = m.User.AvatarUrl,
                addr = m.User.Street + ", " + m.User.House + " · кв. " + m.User.ApartmentNumber,
            })
            .ToListAsync();

        return Ok(list);
    }

    // GET /apartments/{buildingId} — карточки квартир дома со статусом сдачи
    [HttpGet("apartments/{buildingId:guid}")]
    public async Task<IActionResult> GetApartments(Guid buildingId)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var b = await _db.Buildings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == buildingId && x.OrganizationId == orgId);
        if (b == null) return NotFound();

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var residents = (await _db.Users.AsNoTracking()
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && u.Street != null && u.House != null)
            .Select(u => new { u.Id, u.FullName, u.ApartmentNumber, u.Entrance, u.Floor, u.Street, u.House, u.Building })
            .ToListAsync())
            .Where(u => AddressMatches(u.Street, u.House, u.Building, b))
            .ToList();

        var ids = residents.Select(r => r.Id).ToList();

        var delivered = await _db.MeterReadings
            .Where(m => ids.Contains(m.UserId) && m.CreatedAt >= monthStart)
            .GroupBy(m => m.UserId)
            .Select(g => new { UserId = g.Key, LastAt = g.Max(x => x.CreatedAt) })
            .ToDictionaryAsync(x => x.UserId, x => x.LastAt);

        var result = residents
            .OrderBy(r => r.Entrance).ThenBy(r => r.Floor).ThenBy(r => r.ApartmentNumber)
            .Select(r => new
            {
                userId = r.Id,
                apartment = r.ApartmentNumber,
                entrance = r.Entrance,
                floor = r.Floor,
                fullName = r.FullName,
                delivered = delivered.ContainsKey(r.Id),
                lastAt = delivered.TryGetValue(r.Id, out var t) ? (DateTime?)t : null,
            });

        return Ok(result);
    }

    private static string FormatAddr(Domain.Entities.Building b) =>
        string.IsNullOrEmpty(b.Block)
            ? $"{b.Street}, {b.House}"
            : $"{b.Street}, {b.House}{b.Block}";

    private static string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

    private static bool AddressMatches(string? street, string? house, string? block, Domain.Entities.Building b) =>
        Norm(street) == Norm(b.Street)
        && Norm(house) == Norm(b.House)
        && (string.IsNullOrWhiteSpace(b.Block) || Norm(block) == Norm(b.Block));

    private static string RuMonth(int m) => m switch
    {
        1 => "января", 2 => "февраля", 3 => "марта", 4 => "апреля",
        5 => "мая", 6 => "июня", 7 => "июля", 8 => "августа",
        9 => "сентября", 10 => "октября", 11 => "ноября", 12 => "декабря",
        _ => ""
    };
}
