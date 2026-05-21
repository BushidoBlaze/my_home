// =============================================================================
// DTO (Data Transfer Object) — это «контракт» того, что наш API отдаёт клиенту.
// Эти C# классы 1-в-1 соответствуют TypeScript-типам в
// web/src/api/managerDashboard.api.ts. Если поменяете тут — поменяйте и там.
//
// `record` в C# — это короткая запись для неизменяемого класса со значениями.
// Хорошо подходит для DTO, потому что:
//   1. Не нужно писать конструктор и свойства руками.
//   2. JSON-сериализатор корректно сериализует поля.
//   3. Нельзя случайно мутировать ответ после его создания.
// =============================================================================

namespace MyHome.Api.Dtos;

// ---------- 1. KPI-карточки -------------------------------------------------

public record KpiCardDto(
    string Id,           // "tickets" | "unassigned" | "alerts" | "collection" | "meters"
    string Label,        // подпись под значением
    string Value,        // отформатированное число, напр. "148", "91.4%"
    string Delta,        // изменение, напр. "+12%", "−2", или пустая строка
    string DeltaDir,     // "up" | "down" | "flat"
    string Sub,          // дополнительная строка под карточкой
    string Accent        // цвет акцента: "emerald" | "info" | "warning" | "danger" | "violet"
);

public record KpiResponseDto(
    DateTime AsOf,       // когда сформировано значение (UTC)
    List<KpiCardDto> Cards
);

// ---------- 2. Приоритетные заявки ------------------------------------------

public record PriorityTicketDto(
    string Id,
    string Title,
    string SubTitle,
    string Category,
    string Addr,
    string? Assignee,    // null если исполнитель не назначен
    string Sla,
    string SlaTone,
    string Status,
    string StatusTone
);

public record PriorityTicketsResponseDto(
    DateTime AsOf,
    List<PriorityTicketDto> Items,
    int Total            // полное число открытых приоритетных заявок (для «ещё N»)
);

// ---------- 3. Собираемость за текущий месяц --------------------------------

public record CollectionsResponseDto(
    decimal Plan,              // плановый процент, напр. 92
    decimal ActualPct,         // фактический процент, напр. 91.4
    string Accrued,            // начислено, отформатированное "14.2 млн ₽"
    string Received,           // получено
    string Debt,               // долг
    List<decimal> Trend,       // последние 9–12 значений по месяцам
    string PeriodLabel         // "май 2026"
);

// ---------- 4. Регуляторные сроки -------------------------------------------

public record ComplianceDeadlineDto(
    string Id,
    string Category,           // "lift" | "gas" | "fire" | "duct"
    string Title,
    string Addr,
    DateTime DueAt,            // абсолютная дата (UTC)
    string DueLabel,           // отформатированное «через 3 дня», «сегодня», «просрочено»
    int DaysLeft,              // целое число дней. Отрицательное если просрочено.
    string Status              // "burning" | "soon" | "ok"
);

public record ComplianceResponseDto(
    DateTime AsOf,
    List<ComplianceDeadlineDto> Items,
    int Total
);

// ---------- 5. Лента активности (только важные события) --------------------

public record ActivityTextPartDto(
    string Text,
    bool? Bold,
    bool? Muted
);

public record ActivityEventDto(
    string Id,
    DateTime At,               // когда произошло событие (UTC)
    string Time,               // отформатированное локальное время "11:42"
    string Icon,               // "check" | "send" | "alert" | "vote" | "gauge" | "info"
    string Accent,             // цвет акцента
    List<ActivityTextPartDto> TextParts
);

public record ActivityResponseDto(
    DateTime AsOf,
    List<ActivityEventDto> Items
);

// ---------- 6. Активные голосования -----------------------------------------

public record ActiveVoteDto(
    string Id,
    string Title,
    int Quorum,                // % набранного кворума
    int Goal,                  // нужный кворум (обычно 50)
    string Votes,              // "142 / 212" — отформатировано на сервере
    string Tone,               // hex-цвет индикатора (на сервере по бизнес-правилу)
    DateTime EndsAt
);

public record ActiveVotesResponseDto(
    DateTime AsOf,
    List<ActiveVoteDto> Items
);
