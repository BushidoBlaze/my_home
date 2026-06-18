namespace MyHome.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = "Resident";

    /// <summary>
    /// УК, к которой относится пользователь. Менеджеру задаётся при создании,
    /// жильцу — когда его адрес совпал с домом из реестра УК (см. UsersController.UpdateMe).
    /// </summary>
    public Guid? OrganizationId { get; set; }
    public string? Phone { get; set; }
    public string? BirthDate { get; set; }
    public string? AvatarUrl { get; set; }

    // адрес
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Street { get; set; }
    public string? House { get; set; }
    public string? Building { get; set; }   // корпус
    public string? Entrance { get; set; }   // подъезд
    public string? Floor { get; set; }      // этаж
    public string? ApartmentNumber { get; set; }

    // про квартиру
    public int? Residents { get; set; }     // сколько проживает
    public float? Area { get; set; }        // площадь
    public int? Rooms { get; set; }
    public string? ApartmentRole { get; set; } // собственник / наниматель / член семьи

    /// <summary>
    /// Номер лицевого счёта в УК. Уникален в рамках организации.
    /// Если не задан — заполняется при первом обращении из id (детерминированно).
    /// </summary>
    public string? AccountNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ServiceRequest> ServiceRequests { get; set; } = [];
    public Apartment? Apartment { get; set; }
}
