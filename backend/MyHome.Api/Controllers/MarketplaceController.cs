using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/marketplace")]
[Authorize]
public class MarketplaceController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public MarketplaceController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/marketplace/services ? список услуг с фильтрацией
    [HttpGet("services")]
    public async Task<IActionResult> GetServices(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] string sort = "rating")
    {
        var query = _db.Services
            .Where(s => s.IsActive)
            .Include(s => s.Provider)
            .Include(s => s.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(s => s.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(s =>
                EF.Functions.ILike(s.Title, pattern) ||
                EF.Functions.ILike(s.Description, pattern));
        }

        var services = await query.ToListAsync();

        var result = services.Select(s => new
        {
            s.Id,
            s.Title,
            s.Description,
            s.Category,
            s.Price,
            s.ImageUrl,
            s.CreatedAt,
            Provider = new { s.Provider.Id, FullName = s.ProviderName ?? s.Provider.FullName, s.Provider.AvatarUrl, Phone = s.ProviderPhone ?? s.Provider.Phone },
            Rating = s.Reviews.Any() ? Math.Round(s.Reviews.Average(r => r.Rating), 1) : 0,
            ReviewsCount = s.Reviews.Count
        });

        result = sort switch
        {
            "price_asc" => result.OrderBy(s => s.Price),
            "price_desc" => result.OrderByDescending(s => s.Price),
            "new" => result.OrderByDescending(s => s.CreatedAt),
            _ => result.OrderByDescending(s => s.Rating)
        };

        return Ok(result);
    }

    // GET /api/marketplace/services/{id} ? детали услуги
    [HttpGet("services/{id}")]
    public async Task<IActionResult> GetService(Guid id)
    {
        var service = await _db.Services
            .Include(s => s.Provider)
            .Include(s => s.Reviews)
                .ThenInclude(r => r.Resident)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null) return NotFound();

        return Ok(new
        {
            service.Id,
            service.Title,
            service.Description,
            service.Category,
            service.Price,
            service.ImageUrl,
            service.CreatedAt,
            Provider = new { service.Provider.Id, FullName = service.ProviderName ?? service.Provider.FullName, service.Provider.AvatarUrl, Phone = service.ProviderPhone ?? service.Provider.Phone },
            Rating = service.Reviews.Any() ? Math.Round(service.Reviews.Average(r => r.Rating), 1) : 0,
            ReviewsCount = service.Reviews.Count,
            Reviews = service.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    Resident = new { r.Resident.FullName, r.Resident.AvatarUrl }
                })
        });
    }

    // POST /api/marketplace/services ? создать услугу (менеджер)
    [HttpPost("services")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
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

    // POST /api/marketplace/services/{id}/image ? загрузить фото услуги
    [HttpPost("services/{id}/image")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        var service = await _db.Services.FindAsync(id);
        if (service == null) return NotFound();
        if (service.ProviderId != CurrentUserId) return Forbid();

        var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "marketplace");
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path = Path.Combine(folder, fileName);

        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);

        service.ImageUrl = $"/marketplace/{fileName}";
        await _db.SaveChangesAsync();

        return Ok(new { url = service.ImageUrl });
    }

    // POST /api/marketplace/orders ? создать заказ
    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var service = await _db.Services.FindAsync(dto.ServiceId);
        if (service == null) return NotFound("Услуга не найдена");
        if (!service.IsActive) return BadRequest("Услуга недоступна");

        var order = new ServiceOrder
        {
            Id = Guid.NewGuid(),
            ServiceId = dto.ServiceId,
            ResidentId = CurrentUserId,
            Comment = dto.Comment,
            ScheduledAt = dto.ScheduledAt,
        };

        _db.ServiceOrders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(new { order.Id, order.Status, order.ScheduledAt, order.CreatedAt });
    }

    // GET /api/marketplace/orders ? мои заказы
    [HttpGet("orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _db.ServiceOrders
            .Where(o => o.ResidentId == CurrentUserId)
            .Include(o => o.Service)
                .ThenInclude(s => s.Provider)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.Status,
                o.Comment,
                o.ScheduledAt,
                o.CreatedAt,
                o.UpdatedAt,
                Service = new
                {
                    o.Service.Id,
                    o.Service.Title,
                    o.Service.Category,
                    o.Service.Price,
                    o.Service.ImageUrl,
                    Provider = new { o.Service.Provider.FullName }
                }
            })
            .ToListAsync();

        return Ok(orders);
    }

    // PATCH /api/marketplace/orders/{id}/cancel ? отменить заказ
    [HttpPatch("orders/{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        var order = await _db.ServiceOrders.FindAsync(id);
        if (order == null) return NotFound();
        if (order.ResidentId != CurrentUserId) return Forbid();
        if (order.Status == "Done") return BadRequest("Нельзя отменить выполненный заказ");

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { order.Id, order.Status });
    }

    // POST /api/marketplace/services/{id}/reviews ? оставить отзыв
    [HttpPost("services/{id}/reviews")]
    public async Task<IActionResult> AddReview(Guid id, [FromBody] CreateReviewDto dto)
    {
        // Проверяем что у пользователя есть выполненный заказ
        var hasOrder = await _db.ServiceOrders.AnyAsync(o =>
            o.ServiceId == id &&
            o.ResidentId == CurrentUserId &&
            o.Status == "Done");

        if (!hasOrder) return BadRequest("Отзыв можно оставить только после выполнения заказа");

        // Проверяем что отзыв ещё не оставлен
        var exists = await _db.ServiceReviews.AnyAsync(r =>
            r.ServiceId == id && r.ResidentId == CurrentUserId);

        if (exists) return BadRequest("Вы уже оставили отзыв на эту услугу");

        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Оценка должна быть от 1 до 5");

        var review = new ServiceReview
        {
            Id = Guid.NewGuid(),
            ServiceId = id,
            ResidentId = CurrentUserId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        _db.ServiceReviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(new { review.Id, review.Rating, review.Comment, review.CreatedAt });
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
    public record CreateOrderDto(Guid ServiceId, DateTime ScheduledAt, string? Comment);
    public record CreateReviewDto(int Rating, string? Comment);
}