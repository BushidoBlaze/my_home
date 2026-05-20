using System.ComponentModel.DataAnnotations;

namespace ResidentApp.Data.Entities;

public class DeviceSession
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public string DeviceName { get; set; } = string.Empty;
    public string DeviceType { get; set; } = "unknown"; // mobile | tablet | desktop | unknown
    public string Os { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;

    public bool IsRevoked { get; set; } = false;
    public bool IsCurrent { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
}