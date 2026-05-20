using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using OtpNet;
using QRCoder;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<UserSettings> GetOrCreateSettingsAsync(Guid userId)
    {
        var settings = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        if (settings != null) return settings;

        settings = new UserSettings
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };
        _db.UserSettings.Add(settings);
        await _db.SaveChangesAsync();
        return settings;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        return Ok(ToResponse(settings));
    }

    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotifications([FromBody] UpdateNotificationsRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        settings.PushEnabled = req.PushEnabled;
        settings.PushNewRequest = req.PushNewRequest;
        settings.PushStatusChange = req.PushStatusChange;
        settings.EmailEnabled = req.EmailEnabled;
        settings.EmailDigest = req.EmailDigest;
        settings.ChatEnabled = req.ChatEnabled;
        settings.ChatSounds = req.ChatSounds;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(settings));
    }

    [HttpPut("chats")]
    public async Task<IActionResult> UpdateChats([FromBody] UpdateChatsRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        settings.AutoSave = req.AutoSave;
        settings.NightMode = req.NightMode;
        settings.NightModeStart = req.NightModeStart;
        settings.NightModeEnd = req.NightModeEnd;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(settings));
    }

    [HttpPut("privacy")]
    public async Task<IActionResult> UpdatePrivacy([FromBody] UpdatePrivacyRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        settings.PhoneVisibility = req.PhoneVisibility;
        settings.WhoCanWrite = req.WhoCanWrite;
        settings.HideApartment = req.HideApartment;
        settings.TwoFactorEnabled = req.TwoFactorEnabled;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(settings));
    }

    [HttpPut("interface")]
    public async Task<IActionResult> UpdateInterface([FromBody] UpdateInterfaceRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        settings.Theme = req.Theme;
        settings.FontSize = req.FontSize;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(settings));
    }

    [HttpPut("language")]
    public async Task<IActionResult> SetLanguage([FromBody] SetLanguageRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        settings.Language = req.Language;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpGet("devices")]
    public IActionResult GetDevices()
    {
        var ua = Request.Headers.UserAgent.ToString();
        var deviceType = ResolveDeviceType(ua);
        var os = ResolveOs(ua);
        var browser = ResolveBrowser(ua);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return Ok(new[]
        {
            new
            {
                id = "current-session",
                deviceName = $"{os} · {browser}",
                deviceType,
                os,
                browser,
                ip,
                location = "Текущая сеть",
                lastActive = DateTime.UtcNow,
                isCurrent = true
            }
        });
    }

    [HttpDelete("devices/{sessionId}")]
    public IActionResult RevokeDevice(string sessionId) => NoContent();

    [HttpDelete("devices/revoke-all")]
    public IActionResult RevokeAll() => NoContent();

    private static string ResolveDeviceType(string ua)
    {
        var s = ua.ToLowerInvariant();
        if (s.Contains("mobile") || s.Contains("iphone") || s.Contains("android")) return "mobile";
        if (s.Contains("ipad") || s.Contains("tablet")) return "tablet";
        if (string.IsNullOrWhiteSpace(s)) return "unknown";
        return "desktop";
    }

    private static string ResolveOs(string ua)
    {
        var s = ua.ToLowerInvariant();
        if (s.Contains("windows")) return "Windows";
        if (s.Contains("mac os")) return "macOS";
        if (s.Contains("android")) return "Android";
        if (s.Contains("iphone") || s.Contains("ios")) return "iOS";
        if (s.Contains("linux")) return "Linux";
        return "Unknown OS";
    }

    private static string ResolveBrowser(string ua)
    {
        var s = ua.ToLowerInvariant();
        if (s.Contains("edg/")) return "Edge";
        if (s.Contains("opr/") || s.Contains("opera")) return "Opera";
        if (s.Contains("chrome/")) return "Chrome";
        if (s.Contains("firefox/")) return "Firefox";
        if (s.Contains("safari/") && !s.Contains("chrome/")) return "Safari";
        return "Unknown Browser";
    }

    [HttpPost("privacy/2fa")]
    public async Task<IActionResult> Enable2Fa()
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound("Пользователь не найден.");

        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        var secretBytes = KeyGeneration.GenerateRandomKey(20);
        var secretBase32 = Base32Encoding.ToString(secretBytes);
        var otpAuthUri = BuildOtpAuthUri("MyHome", user.Email, secretBase32);

        settings.TwoFactorSecret = secretBase32;
        settings.TwoFactorEnabled = true;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            qrCodeUrl = BuildQrCodeDataUrl(otpAuthUri),
            secret = settings.TwoFactorSecret,
            otpAuthUri
        });
    }

    [HttpDelete("privacy/2fa")]
    public async Task<IActionResult> Disable2Fa([FromBody] Disable2FaRequest req)
    {
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        if (string.IsNullOrWhiteSpace(settings.TwoFactorSecret))
            return NoContent();

        var code = new string((req.Code ?? string.Empty).Where(char.IsDigit).ToArray());
        if (code.Length != 6)
            return BadRequest("Укажите 6-значный код из приложения-аутентификатора.");

        var secretBytes = Base32Encoding.ToBytes(settings.TwoFactorSecret);
        var totp = new Totp(secretBytes);
        var valid = totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
        if (!valid)
            return BadRequest("Неверный код 2FA.");

        settings.TwoFactorEnabled = false;
        settings.TwoFactorSecret = null;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("chats/blacklist")]
    public IActionResult GetBlacklist() => Ok(new List<object>());

    [HttpDelete("chats/blacklist/{userId}")]
    public IActionResult RemoveFromBlacklist(Guid userId) => NoContent();

    [HttpDelete("cache")]
    public IActionResult ClearCache() => NoContent();

    [HttpPost("export")]
    public async Task<IActionResult> ExportData()
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        var settings = await GetOrCreateSettingsAsync(CurrentUserId);
        var payload = new
        {
            exportedAt = DateTime.UtcNow,
            user = user == null ? null : new { user.Id, user.Email, user.FullName, user.Phone },
            settings = ToResponse(settings)
        };
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
        return File(Encoding.UTF8.GetBytes(json), "application/json", "my-home-settings-export.json");
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest req)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();
        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
            return BadRequest(new { message = "Неверный пароль" });

        var settings = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == user.Id);
        if (settings != null) _db.UserSettings.Remove(settings);
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static object ToResponse(UserSettings s) => new
    {
        notifications = new
        {
            pushEnabled = s.PushEnabled,
            pushNewRequest = s.PushNewRequest,
            pushStatusChange = s.PushStatusChange,
            emailEnabled = s.EmailEnabled,
            emailDigest = s.EmailDigest,
            chatEnabled = s.ChatEnabled,
            chatSounds = s.ChatSounds
        },
        chats = new
        {
            autoSave = s.AutoSave,
            nightMode = s.NightMode,
            nightModeStart = s.NightModeStart,
            nightModeEnd = s.NightModeEnd,
            blacklist = Array.Empty<object>()
        },
        privacy = new
        {
            phoneVisibility = s.PhoneVisibility,
            whoCanWrite = s.WhoCanWrite,
            hideApartment = s.HideApartment,
            twoFactorEnabled = s.TwoFactorEnabled
        },
        @interface = new
        {
            theme = s.Theme,
            fontSize = s.FontSize
        },
        language = s.Language
    };

    public sealed class UpdateNotificationsRequest
    {
        public bool PushEnabled { get; set; }
        public bool PushNewRequest { get; set; }
        public bool PushStatusChange { get; set; }
        public bool EmailEnabled { get; set; }
        public string EmailDigest { get; set; } = "weekly";
        public bool ChatEnabled { get; set; }
        public bool ChatSounds { get; set; }
    }

    public sealed class UpdateChatsRequest
    {
        public bool AutoSave { get; set; }
        public bool NightMode { get; set; }
        public string NightModeStart { get; set; } = "22:00";
        public string NightModeEnd { get; set; } = "07:00";
    }

    public sealed class UpdatePrivacyRequest
    {
        public string PhoneVisibility { get; set; } = "contacts";
        public string WhoCanWrite { get; set; } = "everyone";
        public bool HideApartment { get; set; }
        public bool TwoFactorEnabled { get; set; }
    }

    public sealed class UpdateInterfaceRequest
    {
        public string Theme { get; set; } = "light";
        public string FontSize { get; set; } = "medium";
    }

    public sealed class SetLanguageRequest
    {
        public string Language { get; set; } = "ru";
    }

    public sealed class Disable2FaRequest
    {
        public string Code { get; set; } = "";
    }

    public sealed class DeleteAccountRequest
    {
        public string Password { get; set; } = "";
    }

    private static string BuildOtpAuthUri(string issuer, string account, string secretBase32)
    {
        var escapedIssuer = Uri.EscapeDataString(issuer);
        var escapedAccount = Uri.EscapeDataString(account);
        return $"otpauth://totp/{escapedIssuer}:{escapedAccount}?secret={secretBase32}&issuer={escapedIssuer}&digits=6&period=30";
    }

    private static string BuildQrCodeDataUrl(string payload)
    {
        using var generator = new QRCodeGenerator();
        using var qrData = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrData);
        var png = qrCode.GetGraphic(20);
        return $"data:image/png;base64,{Convert.ToBase64String(png)}";
    }
}
