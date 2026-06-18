using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/polls")]
[Authorize]
public class PollsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PollsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // порядок вариантов: За, Против, Воздержался, потом остальные
    private static int OptionRank(string text) => text.Trim().ToLowerInvariant() switch
    {
        "за" => 0,
        "против" => 1,
        var t when t.StartsWith("воздерж") => 2,
        _ => 3,
    };

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = CurrentUserId;
        // голосования принадлежат УК автора, показываем только свои
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        // заодно закрываем просроченные
        var expired = await _db.Polls
            .Where(p => p.Status == "Active" && p.EndsAt < DateTime.UtcNow && p.CreatedBy.OrganizationId == orgId)
            .ToListAsync();
        if (expired.Any())
        {
            expired.ForEach(p => p.Status = "Closed");
            await _db.SaveChangesAsync();
        }

        var polls = await _db.Polls
            .Include(p => p.Options).ThenInclude(o => o.Votes)
            .Include(p => p.Votes)
            .Include(p => p.CreatedBy)
            .Where(p => p.CreatedBy.OrganizationId == orgId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // право голоса есть у жильцов этой УК - нужно для кворума
        var totalEligible = await _db.Users.CountAsync(u => u.Role == "Resident" && u.OrganizationId == orgId);

        var result = polls.Select(p =>
        {
            var myVote = p.Votes.FirstOrDefault(v => v.UserId == userId);
            return new
            {
                p.Id,
                p.Title,
                p.Description,
                p.Category,
                p.Status,
                p.EndsAt,
                p.CreatedAt,
                TotalVoters = p.Votes.Select(v => v.UserId).Distinct().Count(),
                TotalEligible = totalEligible,
                HasVoted = myVote != null,
                MyOptionId = myVote?.OptionId,
                AuthorName = p.CreatedBy != null ? p.CreatedBy.FullName : null,
                Options = p.Options.OrderBy(o => OptionRank(o.Text)).ThenBy(o => o.Text).Select(o => new
                {
                    o.Id,
                    o.Text,
                    Votes = o.Votes.Count
                })
            };
        });

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePollDto dto)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var poll = new Poll
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description ?? "",
            Category = dto.Category ?? "",
            EndsAt = dto.EndsAt,
            CreatedById = CurrentUserId,
            Options = dto.Options.Select(text => new PollOption
            {
                Id = Guid.NewGuid(),
                Text = text
            }).ToList()
        };

        _db.Polls.Add(poll);

        // шлём уведомление всем жильцам УК. По дому пока не фильтруем - в Poll нет такого поля
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var residentIds = await _db.Users
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId)
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var residentId in residentIds)
        {
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = residentId,
                Title = "Новое голосование",
                Message = $"«{poll.Title}» — голосование открыто до {poll.EndsAt:dd.MM.yyyy}",
                Type = "Info",
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { poll.Id, NotifiedResidents = residentIds.Count });
    }

    [HttpPost("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id, [FromBody] VoteDto dto)
    {
        var userId = CurrentUserId;
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        // голосовать можно только в опросах своей УК
        var poll = await _db.Polls
            .Include(p => p.Options)
            .FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);

        if (poll == null) return NotFound();
        if (poll.Status == "Closed") return BadRequest(new { error = "Опрос завершён" });

        var alreadyVoted = await _db.PollVotes.AnyAsync(v => v.PollId == id && v.UserId == userId);
        if (alreadyVoted) return BadRequest(new { error = "Вы уже проголосовали" });

        var option = poll.Options.FirstOrDefault(o => o.Id == dto.OptionId);
        if (option == null) return BadRequest(new { error = "Вариант не найден" });

        _db.PollVotes.Add(new PollVote
        {
            Id = Guid.NewGuid(),
            PollId = id,
            OptionId = dto.OptionId,
            UserId = userId
        });

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpPatch("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);
        if (poll == null) return NotFound();

        poll.Status = "Closed";
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);
        if (poll == null) return NotFound();

        _db.Polls.Remove(poll);
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    // GET /api/polls/{id}/non-voters — кто ещё не проголосовал (для панели менеджера)
    [HttpGet("{id:guid}/non-voters")]
    public async Task<IActionResult> GetNonVoters(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);
        if (poll == null) return NotFound();

        var votedIds = await _db.PollVotes
            .Where(v => v.PollId == id)
            .Select(v => v.UserId)
            .Distinct()
            .ToListAsync();

        var nonVoters = await _db.Users
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && !votedIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.FullName,
                ApartmentNumber = u.ApartmentNumber ?? "",
                LastSeen = "—" // TODO: добавить last-seen tracking
            })
            .ToListAsync();

        return Ok(nonVoters);
    }

    // POST /api/polls/{id}/remind — напоминание всем, кто ещё не голосовал
    [HttpPost("{id:guid}/remind")]
    public async Task<IActionResult> RemindAll(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);
        if (poll == null) return NotFound();
        if (poll.Status == "Closed") return BadRequest(new { error = "Опрос завершён" });

        var votedIds = await _db.PollVotes
            .Where(v => v.PollId == id)
            .Select(v => v.UserId)
            .Distinct()
            .ToListAsync();

        var nonVoterIds = await _db.Users
            .Where(u => u.Role == "Resident" && u.OrganizationId == orgId && !votedIds.Contains(u.Id))
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var uid in nonVoterIds)
        {
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = uid,
                Title = "Не забудьте проголосовать",
                Message = $"«{poll.Title}» — голосование завершится {poll.EndsAt:dd.MM.yyyy}",
                Type = "Info",
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true, notified = nonVoterIds.Count });
    }

    // POST /api/polls/{id}/remind/{userId} — напоминание одному жильцу
    [HttpPost("{id:guid}/remind/{userId:guid}")]
    public async Task<IActionResult> RemindOne(Guid id, Guid userId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Manager") return Forbid();

        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        var poll = await _db.Polls.FirstOrDefaultAsync(p => p.Id == id && p.CreatedBy.OrganizationId == orgId);
        if (poll == null) return NotFound();
        if (poll.Status == "Closed") return BadRequest(new { error = "Опрос завершён" });

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != "Resident" || user.OrganizationId != orgId) return NotFound();

        var alreadyVoted = await _db.PollVotes.AnyAsync(v => v.PollId == id && v.UserId == userId);
        if (alreadyVoted) return BadRequest(new { error = "Уже проголосовал" });

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = "Не забудьте проголосовать",
            Message = $"«{poll.Title}» — голосование завершится {poll.EndsAt:dd.MM.yyyy}",
            Type = "Info",
        });
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }
}

public record CreatePollDto(
    string Title,
    string? Description,
    string? Category,
    DateTime EndsAt,
    List<string> Options
);

public record VoteDto(Guid OptionId);
