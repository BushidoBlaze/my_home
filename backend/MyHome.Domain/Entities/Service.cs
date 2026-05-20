namespace MyHome.Domain.Entities;

public class Service
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? ProviderName { get; set; }
    public string? ProviderPhone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Провайдер услуги
    public Guid ProviderId { get; set; }
    public User Provider { get; set; } = null!;

    // Навигационные свойства
    public ICollection<ServiceOrder> Orders { get; set; } = [];
    public ICollection<ServiceReview> Reviews { get; set; } = [];
}