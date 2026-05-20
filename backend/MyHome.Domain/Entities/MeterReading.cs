namespace MyHome.Domain.Entities;

public class MeterReading
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string MeterType { get; set; } = null!;
    public decimal Value { get; set; }
    public DateTime ReadingDate { get; set; } = DateTime.UtcNow;
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
