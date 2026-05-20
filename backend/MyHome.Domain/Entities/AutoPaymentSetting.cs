namespace MyHome.Domain.Entities;

public class AutoPaymentSetting
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public bool Enabled { get; set; }
    public string? CardMask { get; set; }
    public int DayOfMonth { get; set; } = 10;
    public decimal LimitAmount { get; set; } = 15000m;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
