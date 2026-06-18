namespace MyHome.Domain.Entities;

// Регуляторный срок - обязательная проверка/работа, за просрочку которой УК
// штрафует ГЖИ. Category: Lift (лифты), Gas (ВДГО), Fire (пожарка), Duct (вентканалы).
public class ComplianceDeadline
{
    public Guid Id { get; set; }

    public Guid? OrganizationId { get; set; }   // чья УК

    public string Category { get; set; } = null!;
    public string Title { get; set; } = null!;   // напр. "Освидетельствование лифта №2"
    public string Address { get; set; } = null!; // напр. "Берёзовая, 14"

    public DateTime DueAt { get; set; }          // дедлайн (UTC)
    public DateTime? CompletedAt { get; set; }   // null пока не выполнено

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
