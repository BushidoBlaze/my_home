using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/subscription")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly AppDbContext _db;
    public SubscriptionController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/subscription — текущая подписка
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = CurrentUserId;
        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);

        if (sub == null)
            return Ok(new { plan = "Basic", expiresAt = (DateTime?)null });

        return Ok(new { plan = sub.Plan, expiresAt = sub.ExpiresAt });
    }

    // POST /api/subscription/upgrade — оформить Premium
    [HttpPost("upgrade")]
    public async Task<IActionResult> Upgrade()
    {
        var userId = CurrentUserId;
        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);

        if (sub == null)
        {
            sub = new Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Plan = "Premium",
                ExpiresAt = DateTime.UtcNow.AddMonths(1)
            };
            _db.Subscriptions.Add(sub);
        }
        else
        {
            sub.Plan = "Premium";
            sub.ExpiresAt = DateTime.UtcNow.AddMonths(1);
        }

        await _db.SaveChangesAsync();
        return Ok(new { plan = sub.Plan, expiresAt = sub.ExpiresAt });
    }

    // GET /api/subscription/apartments — мои квартиры
    [HttpGet("apartments")]
    public async Task<IActionResult> GetApartments()
    {
        var userId = CurrentUserId;
        var apts = await _db.UserApartments
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.CreatedAt)
            .Select(a => new { a.Id, a.Label, a.Address, a.IsActive })
            .ToListAsync();

        // Если пусто — отдаём квартиру из профиля как основную
        if (!apts.Any())
        {
            var user = await _db.Users.FindAsync(userId);
            if (user != null)
            {
                var addr = string.Join(", ",
                    new[] { user.Street, user.House != null ? $"д. {user.House}" : null, user.ApartmentNumber != null ? $"кв. {user.ApartmentNumber}" : null }
                    .Where(s => !string.IsNullOrEmpty(s)));
                return Ok(new[] { new { Id = Guid.Empty, Label = "Основная", Address = string.IsNullOrEmpty(addr) ? "Не заполнено" : addr, IsActive = true } });
            }
        }

        return Ok(apts);
    }

    // POST /api/subscription/apartments — добавить квартиру (только Premium)
    [HttpPost("apartments")]
    public async Task<IActionResult> AddApartment([FromBody] AddApartmentDto dto)
    {
        var userId = CurrentUserId;
        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);

        if (sub?.Plan != "Premium")
            return BadRequest(new { error = "Требуется подписка Premium" });

        var count = await _db.UserApartments.CountAsync(a => a.UserId == userId);
        if (count >= 5)
            return BadRequest(new { error = "Максимум 5 квартир" });

        var apt = new UserApartment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Label = dto.Label ?? $"Квартира {count + 2}",
            Address = dto.Address ?? ""
        };

        _db.UserApartments.Add(apt);
        await _db.SaveChangesAsync();
        return Ok(new { apt.Id, apt.Label, apt.Address, apt.IsActive });
    }

    // PUT /api/subscription/apartments/:id/activate — установить активной
    [HttpPut("apartments/{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var userId = CurrentUserId;

        // Снимаем флаг со всех
        var all = await _db.UserApartments.Where(a => a.UserId == userId).ToListAsync();
        all.ForEach(a => a.IsActive = false);

        var target = all.FirstOrDefault(a => a.Id == id);
        if (target == null) return NotFound();

        target.IsActive = true;
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }
}

public record AddApartmentDto(string? Label, string? Address);
