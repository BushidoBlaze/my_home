using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Security;
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

    // Житель: список своих заявок
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

    // МК: список всех заявок (для канбана и списка)
    [HttpGet("all")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAll()
    {
        // Скоуп по УК: менеджер видит только заявки жильцов своих домов.
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);
        if (orgId == null) return Ok(Array.Empty<object>());

        var requests = await _db.ServiceRequests
            .Include(r => r.Resident)
            .Include(r => r.Assignee)
            .Where(r => r.Resident.OrganizationId == orgId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new {
                r.Id,
                r.Title,
                r.Description,
                r.Category,
                r.Status,
                r.Priority,
                r.CreatedAt,
                r.UpdatedAt,
                Resident = new {
                    r.Resident.Id,
                    r.Resident.FullName,
                    r.Resident.Street,
                    r.Resident.House,
                    r.Resident.Building,
                    r.Resident.Entrance,
                    r.Resident.ApartmentNumber
                },
                Assignee = r.Assignee == null ? null : new {
                    r.Assignee.Id,
                    r.Assignee.FullName
                }
            })
            .ToListAsync();

        return Ok(requests);
    }

    // МК: одна заявка по id (для страницы детали)
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var orgId = await ManagerScope.CurrentOrgIdAsync(_db, User);

        var r = await _db.ServiceRequests
            .Include(x => x.Resident)
            .Include(x => x.Assignee)
            .Where(x => x.Id == id && x.Resident.OrganizationId == orgId)
            .Select(x => new {
                x.Id,
                x.Title,
                x.Description,
                x.Category,
                x.Status,
                x.Priority,
                x.CreatedAt,
                x.UpdatedAt,
                Resident = new {
                    x.Resident.Id,
                    x.Resident.FullName,
                    x.Resident.Phone,
                    x.Resident.Email,
                    x.Resident.AvatarUrl,
                    x.Resident.Street,
                    x.Resident.House,
                    x.Resident.Building,
                    x.Resident.Entrance,
                    x.Resident.Floor,
                    x.Resident.ApartmentNumber
                },
                Assignee = x.Assignee == null ? null : new {
                    x.Assignee.Id,
                    x.Assignee.FullName,
                    x.Assignee.AvatarUrl,
                    x.Assignee.Phone
                }
            })
            .FirstOrDefaultAsync();

        return r == null ? NotFound() : Ok(r);
    }

    // МК: изменить статус заявки
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
            Title = "Статус заявки изменён",
            Message = dto.Status switch
            {
                "Assigned"   => $"Заявка \"{request.Title}\" назначена исполнителю",
                "InProgress" => $"Заявка \"{request.Title}\" принята в работу",
                "Review"     => $"Заявка \"{request.Title}\" проходит проверку",
                "Done"       => $"Заявка \"{request.Title}\" выполнена",
                _            => $"Заявка \"{request.Title}\" обновлена: статус {dto.Status}"
            },
            Type = dto.Status == "Done" ? "Success" : "Info",
            RelatedRequestId = request.Id
        });
        await _db.SaveChangesAsync();

        return Ok(new { request.Id, request.Status });
    }

    // PUT /api/requests/{id} — редактирование заявки (только автор)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRequestDto dto)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        // Редактировать разрешено только своей заявке
        if (request.ResidentId != CurrentUserId) return Forbid();

        // Нельзя редактировать закрытую заявку
        if (request.Status == "Done") return BadRequest("Нельзя редактировать закрытую заявку");

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
