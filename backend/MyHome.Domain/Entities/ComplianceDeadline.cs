namespace MyHome.Domain.Entities;

/// <summary>
/// Регуляторный срок: периодическая проверка / обязательная работа,
/// за пропуск которой УК получает штрафы ГЖИ.
///
/// Категории:
///   "Lift" — техническое освидетельствование лифтов
///   "Gas"  — ВДГО (внутридомовое газовое оборудование)
///   "Fire" — пожарная безопасность (огнетушители, СОУЭ)
///   "Duct" — дымоходы и вентканалы
/// </summary>
public class ComplianceDeadline
{
    public Guid Id { get; set; }

    /// <summary>Категория — см. xml-doc выше.</summary>
    public string Category { get; set; } = null!;

    /// <summary>Заголовок: "Освидетельствование лифта №2".</summary>
    public string Title { get; set; } = null!;

    /// <summary>Адрес объекта: "Берёзовая, 14".</summary>
    public string Address { get; set; } = null!;

    /// <summary>Когда работа должна быть выполнена (UTC).</summary>
    public DateTime DueAt { get; set; }

    /// <summary>Когда срок был отмечен выполненным (NULL пока актуален).</summary>
    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
