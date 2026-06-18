using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize] // без авторизации CurrentUserId упадёт
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public UsersController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

    private static bool AddressMatches(string? street, string? house, string? block, Building b) =>
        Norm(street) == Norm(b.Street)
        && Norm(house) == Norm(b.House)
        && (string.IsNullOrWhiteSpace(b.Block) || Norm(block) == Norm(b.Block));

    // GET /api/users/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        // имя УК для шапки кабинета менеджера
        var organizationName = user.OrganizationId == null
            ? null
            : await _db.Organizations
                .Where(o => o.Id == user.OrganizationId)
                .Select(o => o.Name)
                .FirstOrDefaultAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.Phone,
            user.OrganizationId,
            organizationName,
            user.BirthDate,
            user.AvatarUrl,
            user.Country,
            user.City,
            user.Street,
            user.House,
            user.Building,
            user.Entrance,
            user.Floor,
            user.ApartmentNumber,
            user.Residents,
            user.Area,
            user.Rooms,
            user.ApartmentRole,
            user.AccountNumber,
            user.CreatedAt
        });
    }

    // PUT /api/users/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateMeDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        user.BirthDate = dto.BirthDate;
        user.Country = dto.Country;
        user.City = dto.City;
        user.Street = dto.Street;
        user.House = dto.House;
        user.Building = dto.Building;
        user.Entrance = dto.Entrance;
        user.Floor = dto.Floor;
        user.ApartmentNumber = dto.ApartmentNumber;
        user.Residents = dto.Residents;
        user.Area = dto.Area;
        user.Rooms = dto.Rooms;
        user.ApartmentRole = dto.ApartmentRole;

        // привязываем жильца к УК того дома, чей адрес совпал.
        // пересчитываем на каждом сохранении: сменил адрес - сменилась УК,
        // нет совпадения - OrganizationId обнуляется.
        if (user.Role == "Resident")
        {
            var buildings = await _db.Buildings.AsNoTracking().ToListAsync();
            var match = buildings.FirstOrDefault(b => AddressMatches(user.Street, user.House, user.Building, b));
            user.OrganizationId = match?.OrganizationId;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.Phone,
            user.BirthDate,
            user.AvatarUrl,
            user.Country,
            user.City,
            user.Street,
            user.House,
            user.Building,
            user.Entrance,
            user.Floor,
            user.ApartmentNumber,
            user.Residents,
            user.Area,
            user.Rooms,
            user.ApartmentRole,
            user.AccountNumber
        });
    }

    // POST /api/users/avatar
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var (ok, safeExt, error) = UploadSecurity.Validate(file);
        if (!ok) return BadRequest(error);

        // только картинки
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (string.IsNullOrEmpty(safeExt) || !allowed.Contains(safeExt))
            return BadRequest("Допустимые форматы: jpg, jpeg, png, webp");
        var ext = safeExt;

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        // имя файла = id пользователя, старый перезатирается
        var fileName = $"{CurrentUserId}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var avatarUrl = $"/avatars/{fileName}";

        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        user.AvatarUrl = avatarUrl;
        await _db.SaveChangesAsync();

        return Ok(new { url = avatarUrl });
    }

    // PUT /api/users/password
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            return BadRequest(new { message = "Неверный текущий пароль" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Пароль успешно изменён" });
    }

    // PUT /api/users/email — смену email подтверждаем текущим паролем
    [HttpPut("email")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return BadRequest(new { message = "Неверный пароль" });

        var newEmail = (dto.NewEmail ?? "").Trim();
        if (string.IsNullOrWhiteSpace(newEmail) || !newEmail.Contains('@') || newEmail.Length > 256)
            return BadRequest(new { message = "Введите корректный email" });

        if (string.Equals(newEmail, user.Email, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Это ваш текущий email" });

        if (await _db.Users.AnyAsync(u => u.Email == newEmail && u.Id != user.Id))
            return BadRequest(new { message = "Этот email уже занят" });

        user.Email = newEmail;
        await _db.SaveChangesAsync();

        return Ok(new { email = user.Email });
    }
}

public record UpdateMeDto(
    string FullName,
    string? Phone,
    string? BirthDate,
    string? Country,
    string? City,
    string? Street,
    string? House,
    string? Building,
    string? Entrance,
    string? Floor,
    string? ApartmentNumber,
    int? Residents,
    float? Area,
    int? Rooms,
    string? ApartmentRole
);

public record ChangePasswordDto(string OldPassword, string NewPassword);

public record ChangeEmailDto(string NewEmail, string Password);
