using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize] // ? обязательно, иначе CurrentUserId падает
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

    // GET /api/users/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

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
            user.CreatedAt
        });
    }

    // PUT /api/users/me — обновить личные данные
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
            user.ApartmentRole
        });
    }

    // POST /api/users/avatar — загрузить аватар
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Файл не выбран");

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!allowed.Contains(ext))
            return BadRequest("Допустимые форматы: jpg, jpeg, png, webp");

        // Создаём папку wwwroot/avatars если не существует
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        // Имя файла = ID пользователя чтобы перезаписывать старый аватар
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

    // PUT /api/users/password — сменить пароль
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            return BadRequest(new { message = "Неверный текущий пароль" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        // Возвращаем JSON а не строку
        return Ok(new { message = "Пароль успешно изменён" });
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