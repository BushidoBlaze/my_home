namespace MyHome.Domain.Entities;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Status { get; set; } = "New"; // New, InProgress, Done
    public string Category { get; set; } = null!; // Repair, Cleaning, Maintenance
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;
}