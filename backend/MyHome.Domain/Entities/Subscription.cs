namespace MyHome.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Plan { get; set; } = "Basic"; // "Basic" | "Premium"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; } // null = бессрочно (для теста)
}
