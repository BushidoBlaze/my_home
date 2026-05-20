using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/help")]
[Authorize]
public class HelpController : ControllerBase
{
    private readonly AppDbContext _db;

    public HelpController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("content")]
    public IActionResult GetContent()
    {
        var contacts = new
        {
            operatorChatTitle = "Чат с оператором",
            operatorChatDescription = "Операторы помогают по вопросам заявок, начислений и доступа к сервисам ЖК.",
            operatorChatHours = "Ежедневно с 08:00 до 22:00",
            supportEmail = "support@myhome.app",
            hotlinePhone = "+7 (800) 555-12-34"
        };

        var features = new[]
        {
            new { id = "requests", title = "Заявки в УК", description = "Создавайте обращения и отслеживайте их статус в пару кликов." },
            new { id = "chats", title = "Чаты дома", description = "Обсуждайте вопросы с соседями и управляющей компанией." },
            new { id = "expenses", title = "Расходы", description = "Контролируйте начисления и историю оплат." },
            new { id = "marketplace", title = "Маркетплейс услуг", description = "Заказывайте проверенные бытовые услуги для квартиры." },
            new { id = "news", title = "Новости ЖК", description = "Получайте важные объявления и уведомления от УК." },
            new { id = "settings", title = "Настройки", description = "Управляйте приватностью, уведомлениями и интерфейсом." }
        };

        var about = new
        {
            title = "О платформе Мой Дом",
            description = "Мой Дом объединяет жителей и управляющую компанию в одном цифровом пространстве.",
            mission = "Мы делаем управление домом прозрачным и удобным: меньше звонков, больше понятных действий.",
            version = "Backend API v1.0"
        };

        return Ok(new { contacts, features, about });
    }

    [HttpPost("support-requests")]
    public async Task<IActionResult> CreateSupportRequest([FromBody] CreateSupportRequestDto dto)
    {
        var subject = dto.Subject?.Trim();
        var message = dto.Message?.Trim();
        var email = dto.ContactEmail?.Trim();

        if (string.IsNullOrWhiteSpace(subject) || subject.Length < 3)
            return BadRequest("Тема обращения должна содержать минимум 3 символа.");

        if (string.IsNullOrWhiteSpace(message) || message.Length < 10)
            return BadRequest("Сообщение должно содержать минимум 10 символов.");

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Укажите email для обратной связи.");

        var userExists = await _db.Users.AnyAsync(u => u.Id == CurrentUserId);
        if (!userExists) return NotFound("Пользователь не найден.");

        var ticket = new SupportTicket
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            Type = "SupportRequest",
            Subject = subject,
            Message = message,
            ContactEmail = email,
            ContactPhone = dto.ContactPhone?.Trim(),
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _db.SupportTickets.Add(ticket);
        await _db.SaveChangesAsync();

        return Ok(new { id = ticket.Id, status = ticket.Status, createdAt = ticket.CreatedAt });
    }

    [HttpPost("bug-reports")]
    public async Task<IActionResult> CreateBugReport([FromBody] CreateBugReportDto dto)
    {
        var title = dto.Title?.Trim();
        var description = dto.Description?.Trim();

        if (string.IsNullOrWhiteSpace(title) || title.Length < 3)
            return BadRequest("Заголовок ошибки должен содержать минимум 3 символа.");

        if (string.IsNullOrWhiteSpace(description) || description.Length < 10)
            return BadRequest("Описание ошибки должно содержать минимум 10 символов.");

        var userExists = await _db.Users.AnyAsync(u => u.Id == CurrentUserId);
        if (!userExists) return NotFound("Пользователь не найден.");

        var ticket = new SupportTicket
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            Type = "BugReport",
            Subject = title,
            Message = description,
            StepsToReproduce = dto.StepsToReproduce?.Trim(),
            ContactEmail = dto.ContactEmail?.Trim(),
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _db.SupportTickets.Add(ticket);
        await _db.SaveChangesAsync();

        return Ok(new { id = ticket.Id, status = ticket.Status, createdAt = ticket.CreatedAt });
    }

    public sealed class CreateSupportRequestDto
    {
        public string Subject { get; set; } = "";
        public string Message { get; set; } = "";
        public string ContactEmail { get; set; } = "";
        public string? ContactPhone { get; set; }
    }

    public sealed class CreateBugReportDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string? StepsToReproduce { get; set; }
        public string? ContactEmail { get; set; }
    }
}
