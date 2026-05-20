namespace MyHome.Domain.Entities;

public class ServiceReview
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;

    // ќценка от 1 до 5
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}