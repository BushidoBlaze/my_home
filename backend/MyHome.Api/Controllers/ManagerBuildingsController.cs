// Реестр домов УК. Жильцы цепляются к дому по адресу (Street + House + опц. Block),
// по нему же агрегируем финансы и заявки.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/manager/buildings")]
[Authorize(Roles = "Manager")]
public class ManagerBuildingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ManagerBuildingsController(AppDbContext db) => _db = db;

    // GET /api/manager/buildings — список домов со сводкой
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        if (orgId == null) return Ok(Array.Empty<object>());

        var buildings = await _db.Buildings
            .AsNoTracking()
            .Where(b => b.OrganizationId == orgId)
            .OrderBy(b => b.Street).ThenBy(b => b.House).ThenBy(b => b.Block)
            .ToListAsync();

        // жильцы этой УК
        var residents = await _db.Users
            .AsNoTracking()
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && u.Street != null && u.House != null)
            .Select(u => new { u.Id, u.Street, u.House, u.Building })
            .ToListAsync();

        // долги и открытые заявки - тоже по одному запросу
        var debtByUser = await _db.UtilityBills
            .Where(b => b.Status != "Paid")
            .GroupBy(b => b.UserId)
            .Select(g => new { UserId = g.Key, Debt = g.Sum(x => x.Amount) })
            .ToDictionaryAsync(x => x.UserId, x => x.Debt);

        var openTicketsByUser = await _db.ServiceRequests
            .Where(r => r.Status != "Done")
            .GroupBy(r => r.ResidentId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var result = buildings.Select(b =>
        {
            var ids = residents
                .Where(u => AddressMatches(u.Street, u.House, u.Building, b))
                .Select(u => u.Id)
                .ToHashSet();
            var debt = ids.Sum(id => debtByUser.GetValueOrDefault(id, 0m));
            var openTickets = ids.Sum(id => openTicketsByUser.GetValueOrDefault(id, 0));
            var tone = ComputeTone(debt, openTickets);

            return new
            {
                id = b.Id,
                addr = FormatAddr(b),
                city = b.City,
                street = b.Street,
                house = b.House,
                block = b.Block,
                year = b.Year,
                series = b.Series,
                apartmentsTotal = b.ApartmentsTotal,
                areaTotal = b.AreaTotal,
                residentsCount = ids.Count,
                debt,
                openTickets,
                tone,
                flags = BuildFlags(debt, openTickets, b.Year),
            };
        });

        return Ok(result);
    }

    // GET /api/manager/buildings/{id} — паспорт дома, финансы, жильцы
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var b = await _db.Buildings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.OrganizationId == orgId);
        if (b == null) return NotFound();

        // сопоставляем адрес в памяти, нормализованно (без регистра и пробелов),
        // как в списке выше
        var residents = (await _db.Users
            .AsNoTracking()
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && u.Street != null && u.House != null)
            .Select(u => new {
                u.Id, u.FullName, u.Email, u.Phone, u.AvatarUrl,
                u.ApartmentNumber, u.Entrance, u.Floor, u.Area, u.Residents,
                u.Street, u.House, u.Building
            })
            .ToListAsync())
            .Where(u => AddressMatches(u.Street, u.House, u.Building, b))
            .ToList();

        var residentIds = residents.Select(r => r.Id).ToList();

        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var charged = await _db.UtilityBills
            .Where(x => residentIds.Contains(x.UserId) && x.CreatedAt >= monthStart)
            .SumAsync(x => (decimal?)x.Amount) ?? 0m;
        var paid = await _db.UtilityBills
            .Where(x => residentIds.Contains(x.UserId) && x.PaidAt != null && x.PaidAt >= monthStart)
            .SumAsync(x => (decimal?)x.Amount) ?? 0m;
        var debt = await _db.UtilityBills
            .Where(x => residentIds.Contains(x.UserId) && x.Status != "Paid")
            .SumAsync(x => (decimal?)x.Amount) ?? 0m;

        var openTickets = await _db.ServiceRequests
            .CountAsync(r => residentIds.Contains(r.ResidentId) && r.Status != "Done");

        // раскладка жильцов по статусу долга для StatusBar в HouseDetail
        var debtByUser = await _db.UtilityBills
            .Where(x => residentIds.Contains(x.UserId) && x.Status != "Paid")
            .GroupBy(x => x.UserId)
            .Select(g => new { UserId = g.Key, Debt = g.Sum(b => b.Amount), OldestDue = g.Min(b => b.DueDate) })
            .ToListAsync();

        var debtByUserDict = debtByUser.ToDictionary(x => x.UserId);

        var now = DateTime.UtcNow;
        int noDebt = 0, debtUnder3m = 0, debtOver3m = 0;
        foreach (var rid in residentIds)
        {
            if (!debtByUserDict.TryGetValue(rid, out var info))
            {
                noDebt++;
            }
            else
            {
                var monthsOverdue = (now - info.OldestDue).TotalDays / 30;
                if (monthsOverdue >= 3) debtOver3m++;
                else debtUnder3m++;
            }
        }
        var unoccupied = Math.Max(0, b.ApartmentsTotal - residentIds.Count);

        return Ok(new
        {
            id = b.Id,
            addr = FormatAddr(b),
            city = b.City,
            street = b.Street,
            house = b.House,
            block = b.Block,
            year = b.Year,
            series = b.Series,
            cadastre = b.Cadastre,
            floors = b.Floors,
            entrances = b.Entrances,
            lifts = b.Lifts,
            apartmentsTotal = b.ApartmentsTotal,
            areaTotal = b.AreaTotal,
            chairmanName = b.ChairmanName,
            chairmanApartment = b.ChairmanApartment,
            note = b.Note,
            residentsCount = residentIds.Count,
            openTickets,
            finance = new
            {
                charged, paid, debt,
                collectionPct = charged > 0 ? Math.Round(paid / charged * 100m, 1) : 0m
            },
            statusBreakdown = new[]
            {
                new { label = "Нет задолженности",   count = noDebt,      tone = "ok" },
                new { label = "Долг < 3 месяцев",    count = debtUnder3m, tone = "warning" },
                new { label = "Долг > 3 месяцев",    count = debtOver3m,  tone = "danger" },
                new { label = "Незаселено",          count = unoccupied,  tone = "muted" },
            },
            residents = residents.OrderBy(r => r.ApartmentNumber).Select(r => new
            {
                r.Id, r.FullName, r.Email, r.Phone, r.AvatarUrl,
                apartment = r.ApartmentNumber,
                r.Entrance, r.Floor, r.Area, r.Residents,
                debt = debtByUserDict.TryGetValue(r.Id, out var d) ? d.Debt : 0m
            })
        });
    }

    // POST /api/manager/buildings — создать дом (кнопка "Добавить дом")
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBuildingDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Street) || string.IsNullOrWhiteSpace(dto.House))
            return BadRequest("Укажите улицу и номер дома.");

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        if (orgId == null) return BadRequest("Аккаунт не привязан к УК.");

        var b = new Building
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            City = string.IsNullOrWhiteSpace(dto.City) ? "Москва" : dto.City.Trim(),
            Street = dto.Street.Trim(),
            House = dto.House.Trim(),
            Block = string.IsNullOrWhiteSpace(dto.Block) ? null : dto.Block.Trim(),
            Year = dto.Year ?? DateTime.UtcNow.Year,
            Series = dto.Series,
            Cadastre = dto.Cadastre,
            Floors = dto.Floors ?? 0,
            Entrances = dto.Entrances ?? 0,
            Lifts = dto.Lifts ?? 0,
            ApartmentsTotal = dto.ApartmentsTotal ?? 0,
            AreaTotal = dto.AreaTotal ?? 0,
            ChairmanName = dto.ChairmanName,
            ChairmanApartment = dto.ChairmanApartment,
            Note = dto.Note,
        };

        _db.Buildings.Add(b);
        await _db.SaveChangesAsync();
        return Ok(new { id = b.Id, addr = FormatAddr(b) });
    }

    // DELETE /api/manager/buildings/{id} — убрать дом из реестра.
    // жильцы привязаны по адресу (не FK), так что их это не трогает
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var b = await _db.Buildings.FindAsync(id);
        if (b == null || b.OrganizationId != orgId) return NotFound();

        _db.Buildings.Remove(b);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // helpers

    private static string FormatAddr(Building b) =>
        string.IsNullOrEmpty(b.Block)
            ? $"{b.Street}, {b.House}"
            : $"{b.Street}, {b.House}{b.Block}";

    private static string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

    // совпадение жильца и дома по адресу. Улицу и номер сравниваем без регистра/пробелов.
    // корпус учитываем только если он задан у дома, иначе дом без корпуса заберёт всех с этого адреса
    private static bool AddressMatches(string? street, string? house, string? block, Building b) =>
        Norm(street) == Norm(b.Street)
        && Norm(house) == Norm(b.House)
        && (string.IsNullOrWhiteSpace(b.Block) || Norm(block) == Norm(b.Block));

    private static string ComputeTone(decimal debt, int openTickets)
    {
        if (debt > 100_000m || openTickets > 10) return "danger";
        if (debt > 10_000m  || openTickets > 5)  return "warning";
        return "ok";
    }

    private static List<string> BuildFlags(decimal debt, int openTickets, int year)
    {
        var flags = new List<string>();
        if (debt > 100_000m) flags.Add("долг");
        if (openTickets > 10) flags.Add("заявки");
        if (year >= DateTime.UtcNow.Year - 5) flags.Add("новый");
        return flags;
    }

    public sealed class CreateBuildingDto
    {
        public string? City { get; set; }
        public string Street { get; set; } = "";
        public string House { get; set; } = "";
        public string? Block { get; set; }
        public int? Year { get; set; }
        public string? Series { get; set; }
        public string? Cadastre { get; set; }
        public int? Floors { get; set; }
        public int? Entrances { get; set; }
        public int? Lifts { get; set; }
        public int? ApartmentsTotal { get; set; }
        public decimal? AreaTotal { get; set; }
        public string? ChairmanName { get; set; }
        public string? ChairmanApartment { get; set; }
        public string? Note { get; set; }
    }
}
