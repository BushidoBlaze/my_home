// Финансовая сводка УК. Всё считаем по UtilityBills, жильцов к домам цепляем по адресу.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
using MyHome.Infrastructure.Persistence;
using System.Globalization;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/manager/billing")]
[Authorize(Roles = "Manager")]
public class ManagerBillingController : ControllerBase
{
    private readonly AppDbContext _db;
    public ManagerBillingController(AppDbContext db) => _db = db;

    // GET /summary — большие KPI карточки (начислено / получено / долг / % / счета)
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int? year, [FromQuery] int? month)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var monthStart = PeriodStart(year, month);
        var prevMonthStart = monthStart.AddMonths(-1);

        // все счета скоупим по УК через владельца счёта
        var bills = _db.UtilityBills.Where(b => b.User.OrganizationId == orgId);

        var charged = await bills
            .Where(b => b.CreatedAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var received = await bills
            .Where(b => b.PaidAt != null && b.PaidAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var debt = await bills
            .Where(b => b.Status != "Paid")
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var collectionPct = charged > 0 ? Math.Round(received / charged * 100m, 1) : 0m;

        var chargedPrev = await bills
            .Where(b => b.CreatedAt >= prevMonthStart && b.CreatedAt < monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var receivedPrev = await bills
            .Where(b => b.PaidAt != null && b.PaidAt >= prevMonthStart && b.PaidAt < monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var collectionPrevPct = chargedPrev > 0 ? Math.Round(receivedPrev / chargedPrev * 100m, 1) : 0m;

        var billsTotal = await bills.CountAsync(b => b.CreatedAt >= monthStart);
        var billsPaid = await bills.CountAsync(b => b.PaidAt != null && b.PaidAt >= monthStart);

        return Ok(new
        {
            periodLabel = $"{RuMonth(monthStart.Month)} {monthStart.Year}",
            stats = new object[]
            {
                new { id = "charged",    label = "Начислено",         value = charged,                       previous = chargedPrev,            unit = "money" },
                new { id = "received",   label = "Получено",          value = received,                      previous = receivedPrev,           unit = "money" },
                new { id = "debt",       label = "Задолженность",     value = debt,                          previous = (decimal?)null,         unit = "money" },
                new { id = "collection", label = "Собираемость",      value = collectionPct,                 previous = collectionPrevPct,      unit = "percent" },
                new { id = "bills",      label = "Счетов выставлено", value = (decimal)billsTotal,           previous = (decimal?)billsPaid,    unit = "count" },
            }
        });
    }

    // GET /houses — финансы в разрезе домов (для таблицы)
    [HttpGet("houses")]
    public async Task<IActionResult> GetHouses([FromQuery] int? year, [FromQuery] int? month)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        if (orgId == null) return Ok(Array.Empty<object>());

        var monthStart = PeriodStart(year, month);

        var buildings = await _db.Buildings.AsNoTracking()
            .Where(b => b.OrganizationId == orgId)
            .ToListAsync();
        var residents = await _db.Users.AsNoTracking()
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && u.Street != null && u.House != null)
            .Select(u => new { u.Id, u.Street, u.House, u.Building })
            .ToListAsync();

        var bills = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart && b.User.OrganizationId == orgId)
            .Select(b => new { b.UserId, b.Amount, b.PaidAt, b.Status })
            .ToListAsync();
        var allDebt = await _db.UtilityBills
            .Where(b => b.Status != "Paid" && b.User.OrganizationId == orgId)
            .Select(b => new { b.UserId, b.Amount })
            .ToListAsync();

        var rows = buildings
            .OrderBy(b => b.Street).ThenBy(b => b.House).ThenBy(b => b.Block)
            .Select(b =>
            {
                var ids = residents
                    .Where(u => AddressMatches(u.Street, u.House, u.Building, b))
                    .Select(u => u.Id)
                    .ToHashSet();
                var monthBills = bills.Where(x => ids.Contains(x.UserId)).ToList();
                var charged = monthBills.Sum(x => x.Amount);
                var paid = monthBills.Where(x => x.PaidAt != null).Sum(x => x.Amount);
                var debt = allDebt.Where(x => ids.Contains(x.UserId)).Sum(x => x.Amount);
                var pct = charged > 0 ? Math.Round(paid / charged * 100m, 1) : 0m;
                return new
                {
                    id = b.Id,
                    addr = FormatAddr(b),
                    apartments = b.ApartmentsTotal,
                    charged, paid, debt, collectionPct = pct,
                    tone = pct >= 90 ? "ok" : pct >= 75 ? "warning" : "danger"
                };
            });

        return Ok(rows);
    }

    // GET /debtors?limit=10 — топ должников
    [HttpGet("debtors")]
    public async Task<IActionResult> GetDebtors([FromQuery] int limit = 10)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var now = DateTime.UtcNow;
        var debtors = await _db.UtilityBills
            .Where(b => b.Status != "Paid" && b.User.OrganizationId == orgId)
            .GroupBy(b => b.UserId)
            .Select(g => new {
                UserId = g.Key,
                Debt = g.Sum(x => x.Amount),
                OldestDue = g.Min(x => x.DueDate)
            })
            .OrderByDescending(x => x.Debt)
            .Take(limit)
            .ToListAsync();

        var userIds = debtors.Select(d => d.UserId).ToList();
        var users = await _db.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName, u.AvatarUrl, u.Street, u.House, u.ApartmentNumber, u.Phone })
            .ToListAsync();
        var byId = users.ToDictionary(u => u.Id);

        var result = debtors.Select(d =>
        {
            byId.TryGetValue(d.UserId, out var u);
            var months = (int)Math.Max(1, Math.Floor((now - d.OldestDue).TotalDays / 30));
            return new
            {
                userId = d.UserId,
                fullName = u?.FullName ?? "—",
                avatarUrl = u?.AvatarUrl,
                addr = u != null
                    ? $"{u.Street}, {u.House} · кв. {u.ApartmentNumber}"
                    : "—",
                phone = u?.Phone,
                debt = d.Debt,
                monthsOverdue = months,
            };
        });

        return Ok(result);
    }

    // GET /structure — разбивка начислений текущего месяца по категориям (для donut)
    [HttpGet("structure")]
    public async Task<IActionResult> GetStructure([FromQuery] int? year, [FromQuery] int? month)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var monthStart = PeriodStart(year, month);

        var rows = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart && b.User.OrganizationId == orgId)
            .GroupBy(b => b.Category)
            .Select(g => new { category = g.Key, amount = g.Sum(x => x.Amount) })
            .OrderByDescending(x => x.amount)
            .ToListAsync();

        var total = rows.Sum(r => r.amount);

        // палитра под частые категории, остальное серым
        string Color(string cat) => cat.ToLowerInvariant() switch
        {
            var s when s.Contains("содерж") => "#10b981",
            var s when s.Contains("отопл") => "#0ea5e9",
            var s when s.Contains("вод") => "#f59e0b",
            var s when s.Contains("электр") => "#7c3aed",
            var s when s.Contains("домофон") => "#64748b",
            _ => "#94a3b8"
        };

        var items = rows.Select(r => new
        {
            label = r.category,
            amount = r.amount,
            pct = total > 0 ? (int)Math.Round(r.amount / total * 100m) : 0,
            color = Color(r.category)
        });

        return Ok(items);
    }

    // GET /chart?months=12 — помесячный график начислено/получено за период
    [HttpGet("chart")]
    public async Task<IActionResult> GetChart([FromQuery] int months = 12)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var now = DateTime.UtcNow;
        var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(months - 1));

        var bills = await _db.UtilityBills
            .Where(b => b.CreatedAt >= start && b.User.OrganizationId == orgId)
            .Select(b => new { b.Amount, b.CreatedAt, b.PaidAt })
            .ToListAsync();

        var result = new List<object>(months);
        for (int i = 0; i < months; i++)
        {
            var ms = start.AddMonths(i);
            var me = ms.AddMonths(1);
            var charged = bills.Where(b => b.CreatedAt >= ms && b.CreatedAt < me).Sum(b => b.Amount);
            var paid = bills.Where(b => b.PaidAt != null && b.PaidAt >= ms && b.PaidAt < me).Sum(b => b.Amount);
            result.Add(new
            {
                month = ms.ToString("yyyy-MM"),
                label = RuMonthShort(ms.Month),
                charged,
                paid
            });
        }
        return Ok(result);
    }

    private static string RuMonthShort(int m) => m switch
    {
        1 => "янв", 2 => "фев", 3 => "мар", 4 => "апр",
        5 => "май", 6 => "июн", 7 => "июл", 8 => "авг",
        9 => "сен", 10 => "окт", 11 => "ноя", 12 => "дек",
        _ => ""
    };

    // GET /payments/recent?limit=20 — последние оплаченные счета
    [HttpGet("payments/recent")]
    public async Task<IActionResult> GetRecentPayments([FromQuery] int limit = 20)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var payments = await _db.UtilityBills
            .AsNoTracking()
            .Where(b => b.PaidAt != null && b.User.OrganizationId == orgId)
            .OrderByDescending(b => b.PaidAt)
            .Take(limit)
            .Select(b => new {
                id = b.Id,
                paidAt = b.PaidAt!.Value,
                amount = b.Amount,
                title = b.Title,
                category = b.Category,
                payerName = b.User.FullName,
                addr = b.User.Street + ", " + b.User.House + " · кв. " + b.User.ApartmentNumber,
                channel = "Онлайн",
            })
            .ToListAsync();

        return Ok(payments);
    }

    // helpers

    private static string FormatAddr(Domain.Entities.Building b) =>
        string.IsNullOrEmpty(b.Block)
            ? $"{b.Street}, {b.House}"
            : $"{b.Street}, {b.House}{b.Block}";

    // начало периода (UTC), без параметров - текущий месяц
    private static DateTime PeriodStart(int? year, int? month)
    {
        var now = DateTime.UtcNow;
        var y = year ?? now.Year;
        var m = month is >= 1 and <= 12 ? month.Value : now.Month;
        return new DateTime(y, m, 1, 0, 0, 0, DateTimeKind.Utc);
    }

    private static string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

    private static bool AddressMatches(string? street, string? house, string? block, Domain.Entities.Building b) =>
        Norm(street) == Norm(b.Street)
        && Norm(house) == Norm(b.House)
        && (string.IsNullOrWhiteSpace(b.Block) || Norm(block) == Norm(b.Block));

    private static string RuMonth(int m) => m switch
    {
        1 => "Январь", 2 => "Февраль", 3 => "Март", 4 => "Апрель",
        5 => "Май", 6 => "Июнь", 7 => "Июль", 8 => "Август",
        9 => "Сентябрь", 10 => "Октябрь", 11 => "Ноябрь", 12 => "Декабрь",
        _ => ""
    };

    // Используется при сериализации в clientside; CultureInfo здесь не нужен.
    private static CultureInfo Ru => new("ru-RU");
}
