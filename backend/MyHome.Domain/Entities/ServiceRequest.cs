namespace MyHome.Domain.Entities;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;

    // New | InProgress | Done
    public string Status { get; set; } = "New";

    // Repair, Cleaning, Maintenance, Emergency и т.д.
    public string Category { get; set; } = null!;

    // High (авария) | Med (срочная) | Low (плановая).
    // Раньше выводился из категории, теперь отдельное поле.
    public string Priority { get; set; } = "Med";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // кто оставил
    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;

    // исполнитель (null пока не назначен) - сотрудник УК или подрядчик
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
}
