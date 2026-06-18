namespace MyHome.Domain.Entities;

// Дом в обслуживании УК - по сути паспорт здания из реестра.
// Жильцы цепляются к дому по совпадению адреса (Street + House), жёсткого FK нет:
// дом можно завести раньше, чем зарегистрируется первый житель.
public class Building
{
    public Guid Id { get; set; }

    // УК-владелец. Nullable, чтобы пережить миграцию старых строк; сидер дозаполняет.
    public Guid? OrganizationId { get; set; }

    // адрес - по этим полям ищем жильцов
    public string City { get; set; } = "Москва";
    public string Street { get; set; } = null!;
    public string House { get; set; } = null!;
    public string? Block { get; set; }     // корпус

    // паспорт здания
    public int Year { get; set; }
    public string? Series { get; set; }            // серия проекта, напр. П-44Т
    public string? Cadastre { get; set; }          // кадастровый номер
    public int Floors { get; set; }
    public int Entrances { get; set; }
    public int Lifts { get; set; }
    public int ApartmentsTotal { get; set; }
    public decimal AreaTotal { get; set; }         // м² общей площади

    // председатель совета дома + заметка
    public string? ChairmanName { get; set; }
    public string? ChairmanApartment { get; set; }
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
