using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = CurrentUserId;

        // Закрываем просроченные
        var expired = await _db.Polls
            .Where(p => p.Status == "Active" && p.EndsAt < DateTime.UtcNow)
            .ToListAsync();
        if (expired.Any())
        {
            expired.ForEach(p => p.Status = "Closed");
            await _db.SaveChangesAsync();
        }

        var polls = await _db.Polls
            .Include(p => p.Options).ThenInclude(o => o.Votes)
            .Include(p => p.Votes)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

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
                HasVoted = myVote != null,
                MyOptionId = myVote?.OptionId,
                Options = p.Options.Select(o => new
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
        await _db.SaveChangesAsync();
        return Ok(new { poll.Id });
    }

    [HttpPost("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id, [FromBody] VoteDto dto)
    {
        var userId = CurrentUserId;

        var poll = await _db.Polls
            .Include(p => p.Options)
            .FirstOrDefaultAsync(p => p.Id == id);

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

        var poll = await _db.Polls.FindAsync(id);
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

        var poll = await _db.Polls.FindAsync(id);
        if (poll == null) return NotFound();

        _db.Polls.Remove(poll);
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
