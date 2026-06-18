using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // через self-register можно стать только жильцом.
    // Manager/Admin и т.п. раздаёт только админ, иначе любой поднимет себе права.
    private const string DefaultSelfRegisterRole = "Resident";

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // одинаковый ответ, чтобы нельзя было подобрать существующий email
        const string GenericError = "Не удалось зарегистрироваться. Проверьте введённые данные.";

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(GenericError);

        // роль с клиента игнорируем — всегда Resident
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            FullName = dto.FullName,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = DefaultSelfRegisterRole,
            Phone = dto.Phone,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.Phone
        });
    }

    // регистрация УК: заводим новую организацию и её менеджера.
    // менеджер стартует в пустой УК и видит только её данные (скоуп по OrganizationId),
    // так что эскалации прав тут нет.
    [HttpPost("register-manager")]
    public async Task<IActionResult> RegisterManager([FromBody] RegisterManagerDto dto)
    {
        const string GenericError = "Не удалось зарегистрироваться. Проверьте введённые данные.";

        if (string.IsNullOrWhiteSpace(dto.CompanyName) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(GenericError);

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(GenericError);

        var org = new Organization
        {
            Id = Guid.NewGuid(),
            Name = dto.CompanyName.Trim(),
            Subtitle = "Мой Дом",
        };
        _db.Organizations.Add(org);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            FullName = string.IsNullOrWhiteSpace(dto.ContactName) ? dto.CompanyName.Trim() : dto.ContactName.Trim(),
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Manager",
            Phone = dto.Phone,
            OrganizationId = org.Id,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { user.Id, user.Email, user.FullName, user.Role });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized("Неверный email или пароль");

        var token = GenerateToken(user);
        return Ok(new { token, user.Role, user.FullName, user.Id });
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                System.Security.Claims.ClaimValueTypes.Integer64),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // 1 день жизни токена. Полноценного refresh нет, так что это компромисс
        // между удобством и риском при утечке токена из localStorage.
        var token = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record RegisterDto(
    string Email,
    string Password,
    string FullName,
    string? Role,
    string? Phone
);

public record LoginDto(
    string Email,
    string Password
);

public record RegisterManagerDto(
    string CompanyName,
    string Email,
    string Password,
    string? ContactName,
    string? Phone
);
