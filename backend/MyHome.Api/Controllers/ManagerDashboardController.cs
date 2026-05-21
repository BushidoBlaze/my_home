// =============================================================================
// ManagerDashboardController — 6 endpoint-ов, которые питают /manager/home.
//
// Что такое контроллер?
//   Это класс, на методы которого приходят HTTP-запросы. Атрибут [Route]
//   задаёт префикс пути, атрибут [HttpGet("…")] на методе задаёт суффикс.
//   Здесь все URL начинаются с /api/manager/dashboard/…
//
// Что такое [Authorize(Roles = "Manager")]?
//   ASP.NET достаёт из JWT-токена роль пользователя и не пускает в метод
//   никого, кроме менеджера УК. Жилец получит 403.
//
// Что такое AppDbContext?
//   Это Entity Framework Core — ORM, который превращает обычные C# запросы
//   (LINQ) в SQL. Все таблицы доступны через свойства: _db.ServiceRequests,
//   _db.Polls, и т.д. Здесь PostgreSQL.
//
// Что я делаю в каждом методе?
//   1. Беру нужные данные из БД через LINQ к _db.<сущность>.
//   2. Считаю агрегаты (Count, Sum) или формирую списки (Select).
//   3. Форматирую строки на стороне сервера (даты, проценты, дельты).
//   4. Заворачиваю всё в DTO из MyHome.Api.Dtos.
//   5. Возвращаю Ok(dto) — это HTTP 200 + JSON.
//
// Что НЕ делаю:
//   — Не реализую compliance (регуляторные сроки), потому что в Domain нет
//     соответствующей сущности. Отдаю заглушку с TODO — добавим entity позже.
//   — Не считаю SLA на стороне БД честно (нужно поле Priority, DueAt).
//     Использую существующие поля как лучшее приближение.
// =============================================================================

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Dtos;
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

    // -------------------------------------------------------------------------
    // 1) GET /api/manager/dashboard/stats
    // KPI-строка из 5 карточек: открытые / без исполнителя / аварии /
    // собираемость / показания.
    // -------------------------------------------------------------------------
    [HttpGet("stats")]
    public async Task<ActionResult<KpiResponseDto>> GetStats()
    {
        // Считаем агрегаты ОДНИМ запросом к БД, чтобы не делать 5 round-trip-ов.
        // EF Core развернёт это в один SQL с подзапросами.
        // Все четыре счётчика берём ОДНИМ запросом через агрегат по таблице.
        // Теперь все условия — на реальных полях, никаких хаков по подстроке.
        var stats = await _db.ServiceRequests
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Open = g.Count(r => r.Status != "Done"),
                Unassigned = g.Count(r => r.Status != "Done" && r.AssigneeId == null),
                Alerts = g.Count(r => r.Status != "Done" && r.Priority == "High"),
                NewToday = g.Count(r => r.CreatedAt.Date == DateTime.UtcNow.Date),
            })
            .FirstOrDefaultAsync() ?? new { Open = 0, Unassigned = 0, Alerts = 0, NewToday = 0 };

        // Собираемость текущего месяца:
        //   actual % = (получено за месяц) / (начислено за месяц) * 100
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var accrued = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var received = await _db.UtilityBills
            .Where(b => b.PaidAt != null && b.PaidAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var collectionPct = accrued > 0 ? Math.Round(received / accrued * 100m, 1) : 0m;

        // Показания счётчиков за месяц.
        var metersThisMonth = await _db.MeterReadings
            .CountAsync(m => m.CreatedAt >= monthStart);
        // Грубая оценка «целевого» количества показаний — число активных квартир.
        var activeApartments = await _db.Apartments.CountAsync();
        var metersTarget = activeApartments > 0 ? activeApartments : metersThisMonth;
        var metersPct = metersTarget > 0
            ? (int)Math.Round((double)metersThisMonth / metersTarget * 100)
            : 0;

        // Складываем 5 карточек. Порядок здесь определяет порядок отображения.
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

    // -------------------------------------------------------------------------
    // 2) GET /api/manager/dashboard/priority-tickets?limit=6
    // Приоритетная очередь заявок для диспетчера.
    // -------------------------------------------------------------------------
    [HttpGet("priority-tickets")]
    public async Task<ActionResult<PriorityTicketsResponseDto>> GetPriorityTickets([FromQuery] int limit = 6)
    {
        // Берём открытые заявки. .Include() подгружает связанные сущности —
        // здесь жилец (адрес) и исполнитель (имя).
        var openQuery = _db.ServiceRequests
            .Include(r => r.Resident)
            .Include(r => r.Assignee)
            .Where(r => r.Status != "Done");

        var total = await openQuery.CountAsync();

        // Сортировка: сначала High (0), потом Med (1), потом Low (2), внутри — по дате.
        // Это превращает приоритет в число для ORDER BY.
        var items = await openQuery
            .OrderBy(r => r.Priority == "High" ? 0 : r.Priority == "Med" ? 1 : 2)
            .ThenBy(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new PriorityTicketDto(
                Id: $"Т-{r.Id.ToString().Substring(0, 4).ToUpper()}",
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
                StatusTone: r.Status == "InProgress" ? "info" : r.Status == "New" ? "" : "violet"
            ))
            .ToListAsync();

        return Ok(new PriorityTicketsResponseDto(DateTime.UtcNow, items, total));
    }

    // -------------------------------------------------------------------------
    // 3) GET /api/manager/dashboard/collections
    // Собираемость за текущий месяц + тренд за последние 9 месяцев.
    // -------------------------------------------------------------------------
    [HttpGet("collections")]
    public async Task<ActionResult<CollectionsResponseDto>> GetCollections()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var accrued = await _db.UtilityBills
            .Where(b => b.CreatedAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var received = await _db.UtilityBills
            .Where(b => b.PaidAt != null && b.PaidAt >= monthStart)
            .SumAsync(b => (decimal?)b.Amount) ?? 0m;
        var debt = accrued - received;
        var actualPct = accrued > 0 ? Math.Round(received / accrued * 100m, 1) : 0m;

        // Тренд: считаем процент собираемости за каждый из последних 9 месяцев.
        var trend = new List<decimal>();
        for (int i = 8; i >= 0; i--)
        {
            var ms = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var me = ms.AddMonths(1);
            var accruedM = await _db.UtilityBills
                .Where(b => b.CreatedAt >= ms && b.CreatedAt < me)
                .SumAsync(b => (decimal?)b.Amount) ?? 0m;
            var receivedM = await _db.UtilityBills
                .Where(b => b.PaidAt != null && b.PaidAt >= ms && b.PaidAt < me)
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

    // -------------------------------------------------------------------------
    // 4) GET /api/manager/dashboard/compliance?limit=5
    // Регуляторные сроки. Читаем из таблицы ComplianceDeadlines, сортируем по
    // ближайшему дедлайну. Статус (горит / скоро / норма) вычисляем на лету
    // от числа оставшихся дней.
    // -------------------------------------------------------------------------
    [HttpGet("compliance")]
    public async Task<ActionResult<ComplianceResponseDto>> GetCompliance([FromQuery] int limit = 5)
    {
        var now = DateTime.UtcNow;

        // Берём только незавершённые сроки, сортируем по «горячести».
        var query = _db.ComplianceDeadlines
            .Where(c => c.CompletedAt == null)
            .OrderBy(c => c.DueAt);

        var total = await query.CountAsync();
        var rows = await query.Take(limit).ToListAsync();

        var items = rows.Select(c =>
        {
            // Целое число дней до дедлайна. Отрицательное если просрочено.
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

    /// <summary>
    /// Бизнес-правило: до 7 дней — «горит» (надо начинать срочно),
    /// до 21 дня — «скоро» (планировать), дальше — «норма».
    /// </summary>
    private static string ComputeComplianceStatus(int daysLeft) =>
        daysLeft <= 7 ? "burning" : daysLeft <= 21 ? "soon" : "ok";

    // -------------------------------------------------------------------------
    // 5) GET /api/manager/dashboard/activity?limit=6
    // Сжатая лента важных событий — берём из таблицы Notifications.
    // -------------------------------------------------------------------------
    [HttpGet("activity")]
    public async Task<ActionResult<ActivityResponseDto>> GetActivity([FromQuery] int limit = 6)
    {
        // Берём последние уведомления, превращаем в формат ленты активности.
        // В реальности здесь нужно отфильтровать «важные» (тип, источник).
        var notes = await _db.Notifications
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

    // -------------------------------------------------------------------------
    // 6) GET /api/manager/dashboard/active-votes?limit=5
    // Активные голосования с подсчётом голосов и кворумом.
    // -------------------------------------------------------------------------
    [HttpGet("active-votes")]
    public async Task<ActionResult<ActiveVotesResponseDto>> GetActiveVotes([FromQuery] int limit = 5)
    {
        var totalEligible = await _db.Users.CountAsync(u => u.Role == "Resident");

        var polls = await _db.Polls
            .Where(p => p.Status == "Active" && p.EndsAt > DateTime.UtcNow)
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

    // =========================================================================
    // ------- Хелперы форматирования. В реальном проекте лучше вынести в
    //         отдельный сервис, но для одного контроллера достаточно тут. -----
    // =========================================================================

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
        "InProgress" => "В работе",
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
