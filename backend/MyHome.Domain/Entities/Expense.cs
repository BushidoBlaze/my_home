namespace MyHome.Domain.Entities;

public class Expense
{
    public Guid Id { get; set; }

    public Guid? OrganizationId { get; set; }     // чья УК

    public string Category { get; set; } = null!; // Heating, Water, Electricity, Cleaning...
    public decimal Amount { get; set; }
    public string Description { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
