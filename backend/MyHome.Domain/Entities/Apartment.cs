namespace MyHome.Domain.Entities;

public class Apartment
{
    public Guid Id { get; set; }

    public string Country { get; set; } = "Russia";
    public string City { get; set; } = null!;
    public string Street { get; set; } = null!;
    public string Building { get; set; } = null!;
    public string? Block { get; set; }
    public string? Entrance { get; set; }
    
    public int Floor { get; set; }
    public string Number { get; set; } = null!;

    public int Residents { get; set; }
    public double Area { get; set; }
    public int Rooms { get; set; }

    public Guid ResidentId { get; set; }
    public User Resident { get; set; } = null!;
}