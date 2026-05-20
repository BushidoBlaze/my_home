namespace MyHome.Domain.Entities;

public class UtilityBill
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Category { get; set; } = "Utility";
    public string Title { get; set; } = null!;
    public string PeriodLabel { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? PaidAt { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
