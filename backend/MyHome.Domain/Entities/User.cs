namespace MyHome.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = "Resident";
    public string? Phone { get; set; }
    public string? BirthDate { get; set; }
    public string? AvatarUrl { get; set; }

    // Адрес
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Street { get; set; }
    public string? House { get; set; }
    public string? Building { get; set; }   // корпус
    public string? Entrance { get; set; }   // подъезд
    public string? Floor { get; set; }      // этаж
    public string? ApartmentNumber { get; set; } // квартира

    // Параметры квартиры
    public int? Residents { get; set; }     // количество проживающих
    public float? Area { get; set; }        // площадь
    public int? Rooms { get; set; }         // количество комнат
    public string? ApartmentRole { get; set; } // собственник/арендатор/член семьи

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ServiceRequest> ServiceRequests { get; set; } = [];
    public Apartment? Apartment { get; set; }
}