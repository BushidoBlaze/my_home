using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/services")]
[Authorize]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ServicesController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ÃŒ» ”—À”√»
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var services = await _db.Services
            .Where(s => s.ProviderId == CurrentUserId)
            .Include(s => s.Provider)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new {
                s.Id,
                s.Title,
                s.Description,
                s.Category,
                s.Price,
                s.ImageUrl,
                s.CreatedAt,
                ProviderName = s.ProviderName ?? s.Provider.FullName,
                ProviderPhone = s.ProviderPhone ?? s.Provider.Phone,
                ProviderAvatarUrl = s.Provider.AvatarUrl
            })
            .ToListAsync();

        return Ok(services);
    }

    // —Œ«ƒ¿“‹ ”—À”√”
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return Unauthorized();

        var service = new Service
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            ProviderName = string.IsNullOrWhiteSpace(dto.ProviderName) ? user.FullName : dto.ProviderName.Trim(),
            ProviderPhone = string.IsNullOrWhiteSpace(dto.ProviderPhone) ? user.Phone : dto.ProviderPhone.Trim(),
            ProviderId = CurrentUserId
        };

        _db.Services.Add(service);
        await _db.SaveChangesAsync();

        return Ok(service);
    }

    // «¿√–”« ¿ ‘Œ“Œ
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "services");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(folder, fileName);

        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new { url = $"/services/{fileName}" });
    }
}

public record CreateServiceDto(
    string Title,
    string Description,
    string Category,
    decimal Price,
    string? ImageUrl,
    string? ProviderName,
    string? ProviderPhone
);