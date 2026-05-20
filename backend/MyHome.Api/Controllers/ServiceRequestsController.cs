using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/requests")]
[Authorize]
public class ServiceRequestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServiceRequestsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Житель: мои заявки
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var requests = await _db.ServiceRequests
            .Where(r => r.ResidentId == CurrentUserId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new {
                r.Id,
                r.Title,
                r.Category,
                r.Status,
                r.CreatedAt,
                r.Description
            })
            .ToListAsync();

        return Ok(requests);
    }

    // Житель: создать заявку
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRequestDto dto)
    {
        var request = new ServiceRequest
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            ResidentId = CurrentUserId
        };

        _db.ServiceRequests.Add(request);
        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            Title = "Заявка создана",
            Message = $"Заявка \"{request.Title}\" принята в работу",
            Type = "Success",
            RelatedRequestId = request.Id
        });
        await _db.SaveChangesAsync();
        return Ok(request);
    }

    // УК: все заявки
    [HttpGet("all")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _db.ServiceRequests
            .Include(r => r.Resident)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new {
                r.Id,
                r.Title,
                r.Category,
                r.Status,
                r.CreatedAt,
                r.Description,
                Resident = r.Resident.FullName
            })
            .ToListAsync();

        return Ok(requests);
    }

    // УК: сменить статус заявки
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = dto.Status;
        request.UpdatedAt = DateTime.UtcNow;

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = request.ResidentId,
            Title = "Статус заявки обновлен",
            Message = dto.Status switch
            {
                "InProgress" => $"Заявка \"{request.Title}\" переведена в работу",
                "Done" => $"Заявка \"{request.Title}\" выполнена",
                _ => $"Заявка \"{request.Title}\" получила статус: {dto.Status}"
            },
            Type = dto.Status == "Done" ? "Success" : "Info",
            RelatedRequestId = request.Id
        });
        await _db.SaveChangesAsync();

        return Ok(new { request.Id, request.Status });
    }

    // PUT /api/requests/{id} — редактировать заявку (только автор)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRequestDto dto)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        // Редактировать может только владелец заявки
        if (request.ResidentId != CurrentUserId) return Forbid();

        // Нельзя редактировать выполненную заявку
        if (request.Status == "Done") return BadRequest("Нельзя редактировать выполненную заявку");

        request.Title = dto.Title;
        request.Description = dto.Description;
        request.Category = dto.Category;
        request.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(request);
    }

    // DELETE /api/requests/{id} — удалить заявку (только автор)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        if (request.ResidentId != CurrentUserId) return Forbid();

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            Title = "Заявка отменена",
            Message = $"Заявка \"{request.Title}\" была отменена",
            Type = "Warning",
            RelatedRequestId = request.Id
        });
        _db.ServiceRequests.Remove(request);
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    public record UpdateRequestDto(string Title, string Description, string Category);
}

public record CreateRequestDto(string Title, string Description, string Category);
public record UpdateStatusDto(string Status);