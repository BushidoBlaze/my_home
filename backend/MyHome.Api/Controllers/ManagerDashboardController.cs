// Дашборд менеджера: 6 ручек для /manager/home (KPI, заявки, собираемость,
// сроки, лента, голосования). Всё скоупится по организации текущего менеджера.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Dtos;
using MyHome.Api.Security;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Globalization;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/manager/dashboard")]
[Authorize(Roles = "Manager")]
public class ManagerDashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public ManagerDashboardController(AppDbContext db) => _db = db;

    // GET /api/manager/dashboard/stats — строка KPI из 5 карточек
    [HttpGet("stats")]
    public async Task<ActionResult<KpiResponseDto>> GetStats()
    {
        // все счётчики одним запросом, чтобы не гонять 5 раз в БД
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var stats = await _db.ServiceRequests
            .Where(r => r.Resident.OrganizationId == orgId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Open = g.Count(r => r.Status != "Done"),
                Unassigned = g.Count(r => r.Status != "Done" && r.AssigneeId == null),
                Alerts = g.Count(r => r.Status != "Done" && r.Priority == "High"),
                NewToday = g.Count(r => r.CreatedAt.Date == DateTime.UtcNow.Date),
            })
            .FirstOrDefaultAsync() ?? new { Open = 0, Unassigned = 0, Alerts = 0, NewToday = 0 };

        // собираемость за месяц = получено / начислено * 100
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var accrued = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart && b.User.OrganizationId == orgId)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var received = await _db.UtilityBills
            .Where(b => b.PaidAt != null && b.PaidAt >= monthStart && b.User.OrganizationId == orgId)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var collectionPct = accrued > 0 ? Math.Round(received / accrued * 100m, 1) : 0m;

        var metersThisMonth = await _db.MeterReadings
            .CountAsync(m => m.CreatedAt >= monthStart && m.User.OrganizationId == orgId);
        // за "план" по показаниям берём число активных квартир (грубо)
        var activeApartments = await _db.Apartments.CountAsync(a => a.Resident.OrganizationId == orgId);
        var metersTarget = activeApartments > 0 ? activeApartments : metersThisMonth;
        var metersPct = metersTarget > 0
            ? (int)Math.Round((double)metersThisMonth / metersTarget * 100)
            : 0;

        // порядок карточек = порядок на экране
        var cards = new List<KpiCardDto>
        {
            new(
                Id: "tickets",
                Label: "Открытые заявки",
                Value: stats.Open.ToString(),
                Delta: stats.NewToday > 0 ? $"+{stats.NewToday}" : "",
                DeltaDir: stats.NewToday > 0 ? "up" : "flat",
                Sub: $"за сегодня {stats.NewToday} новых",
                Accent: "emerald"
            ),
            new(
                Id: "unassigned",
                Label: "Без исполнителя",
                Value: stats.Unassigned.ToString(),
                Delta: "",
                DeltaDir: "flat",
                Sub: stats.Unassigned > 0 ? "нужно распределить" : "все распределены",
                Accent: "warning"
            ),
            new(
                Id: "alerts",
                Label: "Аварии и SLA-риски",
                Value: stats.Alerts.ToString(),
                Delta: "",
                DeltaDir: "flat",
                Sub: stats.Alerts > 0 ? "требуют немедленных действий" : "нет активных аварий",
                Accent: "danger"
            ),
            new(
                Id: "collection",
                Label: $"Собираемость, {RuMonth(DateTime.UtcNow.Month)}",
                Value: $"{collectionPct.ToString(CultureInfo.InvariantCulture)}%",
                Delta: "",
                DeltaDir: "flat",
                Sub: "план 92%",
                Accent: "info"
            ),
            new(
                Id: "meters",
                Label: "Передано показаний",
                Value: metersThisMonth.ToString("N0", new CultureInfo("ru-RU")),
                Delta: "",
                DeltaDir: "flat",
                Sub: $"из {metersTarget} · {metersPct}%",
                Accent: "violet"
            ),
        };

        return Ok(new KpiResponseDto(DateTime.UtcNow, cards));
    }

    // GET /api/manager/dashboard/priority-tickets?limit=6 — очередь для диспетчера
    [HttpGet("priority-tickets")]
    public async Task<ActionResult<PriorityTicketsResponseDto>> GetPriorityTickets([FromQuery] int limit = 6)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var openQuery = _db.ServiceRequests
            .Include(r => r.Resident)
            .Include(r => r.Assignee)
            .Where(r => r.Status != "Done" && r.Resident.OrganizationId == orgId);

        var total = await openQuery.CountAsync();

        // High -> Med -> Low, внутри приоритета по дате
        var items = await openQuery
            .OrderBy(r => r.Priority == "High" ? 0 : r.Priority == "Med" ? 1 : 2)
            .ThenBy(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new PriorityTicketDto(
                Id: r.Id.ToString(),
                Title: r.Title,
                SubTitle: r.Priority == "High" ? "Аварийная"
                        : r.Priority == "Med"  ? "Срочная"
                        : "Плановая",
                Category: MapCategory(r.Category),
                Addr: r.Resident.Street != null
                    ? $"{r.Resident.Street}, {r.Resident.House} · кв. {r.Resident.ApartmentNumber}"
                    : "—",
                Assignee: r.Assignee != null ? r.Assignee.FullName : null,
                Sla: FormatSla(r.CreatedAt),
                SlaTone: SlaTone(r.CreatedAt),
                Status: MapStatus(r.Status),
                StatusTone: r.Status == "InProgress" ? "info" : r.Status == "Review" ? "warning" : ""
            ))
            .ToListAsync();

        return Ok(new PriorityTicketsResponseDto(DateTime.UtcNow, items, total));
    }

    // GET /api/manager/dashboard/collections — собираемость + тренд за 9 мес.
    [HttpGet("collections")]
    public async Task<ActionResult<CollectionsResponseDto>> GetCollections()
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var accrued = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart && b.User.OrganizationId == orgId)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var received = await _db.UtilityBills
            .Where(b => b.PaidAt != null && b.PaidAt >= monthStart && b.User.OrganizationId == orgId)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var debt = accrued - received;
        var actualPct = accrued > 0 ? Math.Round(received / accrued * 100m, 1) : 0m;

        // процент собираемости по каждому из последних 9 месяцев
        var trend = new List<decimal>();
        for (int i = 8; i >= 0; i--)
        {
            var ms = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var me = ms.AddMonths(1);
            var accruedM = await _db.UtilityBills
                .Where(b => b.CreatedAt >= ms && b.CreatedAt < me && b.User.OrganizationId == orgId)
                .SumAsync(b => (decimal?)b.Amount) ?? 0m;
            var receivedM = await _db.UtilityBills
                .Where(b => b.PaidAt != null && b.PaidAt >= ms && b.PaidAt < me && b.User.OrganizationId == orgId)
                .SumAsync(b => (decimal?)b.Amount) ?? 0m;
            trend.Add(accruedM > 0 ? Math.Round(receivedM / accruedM * 100m, 0) : 0m);
        }

        return Ok(new CollectionsResponseDto(
            Plan: 92m,
            ActualPct: actualPct,
            Accrued: FormatMoneyShort(accrued),
            Received: FormatMoneyShort(received),
            Debt: FormatMoneyShort(debt),
            Trend: trend,
            PeriodLabel: $"{RuMonth(now.Month)} {now.Year}"
        ));
    }

    // GET /api/manager/dashboard/compliance?limit=5 — регуляторные сроки,
    // статус (горит/скоро/норма) считаем на лету от числа оставшихся дней
    [HttpGet("compliance")]
    public async Task<ActionResult<ComplianceResponseDto>> GetCompliance([FromQuery] int limit = 5)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var now = DateTime.UtcNow;

        // только незакрытые сроки своей УК, ближайшие сверху
        var query = _db.ComplianceDeadlines
            .Where(c => c.CompletedAt == null && c.OrganizationId == orgId)
            .OrderBy(c => c.DueAt);

        var total = await query.CountAsync();
        var rows = await query.Take(limit).ToListAsync();

        var items = rows.Select(c =>
        {
            // дней до дедлайна, отрицательное = просрочено
            var daysLeft = (int)Math.Floor((c.DueAt - now).TotalDays);
            return new ComplianceDeadlineDto(
                Id: c.Id.ToString(),
                Category: c.Category.ToLowerInvariant(),
                Title: c.Title,
                Addr: c.Address,
                DueAt: c.DueAt,
                DueLabel: FormatDaysLabel(daysLeft),
                DaysLeft: daysLeft,
                Status: ComputeComplianceStatus(daysLeft)
            );
        }).ToList();

        return Ok(new ComplianceResponseDto(now, items, total));
    }

    // <=7 дней горит, <=21 скоро, дальше норма
    private static string ComputeComplianceStatus(int daysLeft) =>
        daysLeft <= 7 ? "burning" : daysLeft <= 21 ? "soon" : "ok";

    // GET /api/manager/dashboard/activity?limit=6 — лента событий из Notifications
    [HttpGet("activity")]
    public async Task<ActionResult<ActivityResponseDto>> GetActivity([FromQuery] int limit = 6)
    {
        // последние уведомления как лента (потом можно фильтровать по типу/важности)
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var notes = await _db.Notifications
            .Where(n => n.User.OrganizationId == orgId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var items = notes.Select(n => new ActivityEventDto(
            Id: n.Id.ToString(),
            At: n.CreatedAt,
            Time: n.CreatedAt.ToLocalTime().ToString("HH:mm"),
            Icon: MapNotificationIcon(n.Type),
            Accent: MapNotificationAccent(n.Type),
            TextParts: new List<ActivityTextPartDto>
            {
                new($"{n.Title} · ", false, false),
                new(n.Message, false, true),
            }
        )).ToList();

        return Ok(new ActivityResponseDto(DateTime.UtcNow, items));
    }

    // GET /api/manager/dashboard/active-votes?limit=5 — активные опросы + кворум
    [HttpGet("active-votes")]
    public async Task<ActionResult<ActiveVotesResponseDto>> GetActiveVotes([FromQuery] int limit = 5)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var totalEligible = await _db.Users.CountAsync(u => u.Role == "Resident" && u.OrganizationId == orgId);

        var polls = await _db.Polls
            .Where(p => p.Status == "Active" && p.EndsAt > DateTime.UtcNow && p.CreatedBy.OrganizationId == orgId)
            .OrderBy(p => p.EndsAt)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.EndsAt,
                VotesCount = p.Votes.Count
            })
            .ToListAsync();

        var items = polls.Select(p =>
        {
            var quorum = totalEligible > 0 ? (int)Math.Round((double)p.VotesCount / totalEligible * 100) : 0;
            return new ActiveVoteDto(
                Id: p.Id.ToString(),
                Title: p.Title,
                Quorum: quorum,
                Goal: 50,
                Votes: $"{p.VotesCount} / {totalEligible}",
                Tone: quorum >= 50 ? "#10b981" : quorum >= 30 ? "#f59e0b" : "#ef4444",
                EndsAt: p.EndsAt
            );
        }).ToList();

        return Ok(new ActiveVotesResponseDto(DateTime.UtcNow, items));
    }

    // хелперы форматирования

    private static string MapCategory(string c) => c switch
    {
        "Plumbing" => "plumbing",
        "Electric" => "electric",
        "Heating" => "heating",
        "Lift" => "lift",
        "Cleaning" => "cleaning",
        "Repair" => "repair",
        _ => "other",
    };

    private static string MapStatus(string s) => s switch
    {
        "New" => "Новая",
        // старый статус Assigned показываем как Новая
        "Assigned" => "Новая",
        "InProgress" => "В работе",
        "Review" => "На проверке",
        "Done" => "Выполнена",
        _ => s,
    };

    private static string FormatSla(DateTime createdAt)
    {
        var age = DateTime.UtcNow - createdAt;
        if (age.TotalHours < 1) return $"{(int)age.TotalMinutes}м";
        if (age.TotalDays < 1) return $"{(int)age.TotalHours}:{age.Minutes:D2}";
        return $"{(int)age.TotalDays}д";
    }

    private static string SlaTone(DateTime createdAt)
    {
        var age = DateTime.UtcNow - createdAt;
        if (age.TotalHours >= 24) return "danger";
        if (age.TotalHours >= 4)  return "warning";
        return "info";
    }

    private static string FormatMoneyShort(decimal amount)
    {
        // 14 200 000 → "14.2 млн ₽", 1 210 000 → "1.21 млн ₽", иначе тыс.
        var ru = new CultureInfo("ru-RU");
        if (Math.Abs(amount) >= 1_000_000m)
            return $"{(amount / 1_000_000m).ToString("0.##", ru)} млн ₽";
        if (Math.Abs(amount) >= 1_000m)
            return $"{(amount / 1_000m).ToString("0.#", ru)} тыс ₽";
        return $"{amount.ToString("0", ru)} ₽";
    }

    private static string FormatDaysLabel(int days)
    {
        if (days < 0) return $"просрочено на {-days} дн";
        if (days == 0) return "сегодня";
        if (days == 1) return "завтра";
        return $"через {days} {Plural(days, "день", "дня", "дней")}";
    }

    private static string Plural(int n, string one, string few, string many)
    {
        var mod10 = n % 10;
        var mod100 = n % 100;
        if (mod10 == 1 && mod100 != 11) return one;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
        return many;
    }

    private static string MapNotificationIcon(string type) => type switch
    {
        "Success" => "check",
        "Warning" => "alert",
        "Error" => "alert",
        _ => "info",
    };

    private static string MapNotificationAccent(string type) => type switch
    {
        "Success" => "emerald",
        "Warning" => "warning",
        "Error" => "danger",
        _ => "info",
    };

    private static string RuMonth(int month) => month switch
    {
        1 => "январь", 2 => "февраль", 3 => "март",
        4 => "апрель", 5 => "май", 6 => "июнь",
        7 => "июль", 8 => "август", 9 => "сентябрь",
        10 => "октябрь", 11 => "ноябрь", 12 => "декабрь",
        _ => "",
    };
}
