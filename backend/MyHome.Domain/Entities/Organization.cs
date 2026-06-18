namespace MyHome.Domain.Entities;

// Управляющая компания. Дома и менеджеры принадлежат конкретной УК,
// жильцы цепляются к ней через свой дом. Менеджерские выборки скоупятся по Id.
public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Subtitle { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Building> Buildings { get; set; } = [];
}
