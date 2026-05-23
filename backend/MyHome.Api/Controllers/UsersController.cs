using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyHome.Api.Security;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize] // ? �����������, ����� CurrentUserId ������
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

    // PUT /api/users/me � �������� ������ ������
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

    // POST /api/users/avatar � ��������� ������
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var (ok, safeExt, error) = UploadSecurity.Validate(file);
        if (!ok) return BadRequest(error);

        // Аватар — строго whitelist картинок.
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (string.IsNullOrEmpty(safeExt) || !allowed.Contains(safeExt))
            return BadRequest("Допустимые форматы: jpg, jpeg, png, webp");
        var ext = safeExt;

        // ������ ����� wwwroot/avatars ���� �� ����������
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        // ��� ����� = ID ������������ ����� �������������� ������ ������
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

    // PUT /api/users/password � ������� ������
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            return BadRequest(new { message = "�������� ������� ������" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        // ���������� JSON � �� ������
        return Ok(new { message = "������ ������� �������" });
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