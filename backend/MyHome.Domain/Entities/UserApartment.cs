namespace MyHome.Domain.Entities;

public class UserApartment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Label { get; set; } = "Квартира";
    public string Address { get; set; } = "";
    public bool IsActive { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
