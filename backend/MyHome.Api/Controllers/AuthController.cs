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

    // Роли, которые житель может назначить себе сам через self-register.
    // Все остальные роли (Manager, Admin, Chairman, HOA) выдаются только
    // существующим админом — иначе тривиальная эскалация привилегий.
    private const string DefaultSelfRegisterRole = "Resident";

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // Унифицированный ответ — чтобы не давать user enumeration по существующему email.
        const string GenericError = "Не удалось зарегистрироваться. Проверьте введённые данные.";

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(GenericError);

        // ВАЖНО: роль приходит от клиента и НИКОГДА не принимается на доверии.
        // Self-register всегда создаёт Resident. Manager-аккаунт назначается отдельной admin-only ручкой.
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

        // Сократили срок жизни access-токена: 1 день вместо 7. Без полноценного refresh
        // это компромисс между UX и blast-radius при утечке токена из localStorage.
        var token = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// ���������� DTO � �������� Phone
public record RegisterDto(
    string Email,
    string Password,
    string FullName,
    string? Role,
    string? Phone  // ������� ��� ��
);

public record LoginDto(
    string Email,
    string Password
);