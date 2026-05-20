namespace MyHome.Domain.Entities;

public class SupportTicket
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = "SupportRequest";
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? StepsToReproduce { get; set; }
    public string Status { get; set; } = "New";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
