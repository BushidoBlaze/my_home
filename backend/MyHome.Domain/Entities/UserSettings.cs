using System.ComponentModel.DataAnnotations;

namespace MyHome.Domain.Entities;

public class UserSettings
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    // Notification settings
    public bool PushEnabled { get; set; } = true;
    public bool PushNewRequest { get; set; } = true;
    public bool PushStatusChange { get; set; } = true;
    public bool EmailEnabled { get; set; } = false;
    public string EmailDigest { get; set; } = "weekly"; // never | daily | weekly
    public bool ChatEnabled { get; set; } = true;
    public bool ChatSounds { get; set; } = true;

    // Chat settings
    public bool AutoSave { get; set; } = true;
    public bool NightMode { get; set; } = false;
    public string NightModeStart { get; set; } = "22:00";
    public string NightModeEnd { get; set; } = "07:00";

    // Privacy settings
    public string PhoneVisibility { get; set; } = "contacts"; // everyone | contacts | nobody
    public string WhoCanWrite { get; set; } = "everyone";
    public bool HideApartment { get; set; } = false;
    public bool TwoFactorEnabled { get; set; } = false;
    public string? TwoFactorSecret { get; set; }

    // Interface settings
    public string Theme { get; set; } = "light";   // light | dark | system
    public string FontSize { get; set; } = "medium";  // small | medium | large

    // Language settings
    public string Language { get; set; } = "ru";

    // Service metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}