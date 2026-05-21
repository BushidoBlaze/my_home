namespace MyHome.Domain.Entities;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;

    /// <summary>"New" | "InProgress" | "Done".</summary>
    public string Status { get; set; } = "New";

    /// <summary>Категория: Repair, Cleaning, Maintenance, Emergency, etc.</summary>
    public string Category { get; set; } = null!;

    /// <summary>
    /// Приоритет заявки: "High" (авария) | "Med" (срочная) | "Low" (плановая).
    /// Раньше определялся по Category — теперь явное поле.
    /// </summary>
    public string Priority { get; set; } = "Med";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Кто оставил заявку.</summary>
    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;

    /// <summary>
    /// Назначенный исполнитель (NULL если ещё не распределена).
    /// Это либо сотрудник УК, либо подрядчик — у обоих роль в таблице Users.
    /// </summary>
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
}
