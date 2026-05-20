using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("my")]
    public async Task<IActionResult> GetMy([FromQuery] bool unreadOnly = false, [FromQuery] int take = 30)
    {
        take = Math.Clamp(take, 1, 100);
        var query = _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == CurrentUserId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .Select(n => new
            {
                id = n.Id,
                title = n.Title,
                message = n.Message,
                type = n.Type,
                isRead = n.IsRead,
                createdAt = n.CreatedAt,
                readAt = n.ReadAt,
                relatedRequestId = n.RelatedRequestId
            })
            .ToListAsync();

        var unreadCount = await _db.Notifications.CountAsync(n => n.UserId == CurrentUserId && !n.IsRead);

        return Ok(new { items, unreadCount });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId);

        if (notification == null) return NotFound();

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPatch("{id}/unread")]
    public async Task<IActionResult> MarkUnread(Guid id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId);

        if (notification == null) return NotFound();

        notification.IsRead = false;
        notification.ReadAt = null;
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var list = await _db.Notifications
            .Where(n => n.UserId == CurrentUserId && !n.IsRead)
            .ToListAsync();

        foreach (var item in list)
        {
            item.IsRead = true;
            item.ReadAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { updated = list.Count });
    }
}
