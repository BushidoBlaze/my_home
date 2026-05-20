namespace MyHome.Domain.Entities;

public class ServiceOrder
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;

    // Статус: Pending, Confirmed, InProgress, Done, Cancelled
    public string Status { get; set; } = "Pending";
    public string? Comment { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}