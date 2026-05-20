using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/news")]
[Authorize]
public class NewsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public NewsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsNewsAdmin =>
        User.IsInRole("Admin") ||
        User.IsInRole("Manager") ||
        User.IsInRole("Chairman") ||
        User.IsInRole("HOA");

    private async Task<bool> IsAuthorOrAdminAsync(Guid postId)
    {
        var post = await _db.NewsPosts.FirstOrDefaultAsync(x => x.Id == postId);
        if (post == null) return false;
        return post.CreatedById == CurrentUserId || IsNewsAdmin;
    }

    [HttpGet]
    public async Task<IActionResult> GetNews(
        [FromQuery] string? category,
        [FromQuery] string? importance,
        [FromQuery] string? sourceType,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 5, 50);

        var query = _db.NewsPosts
            .AsNoTracking()
            .Include(x => x.CreatedBy)
            .Include(x => x.Attachments)
            .Include(x => x.Comments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(x => x.Category == category);

        if (!string.IsNullOrWhiteSpace(importance))
            query = query.Where(x => x.Importance == importance);

        if (!string.IsNullOrWhiteSpace(sourceType))
            query = query.Where(x => x.SourceType == sourceType);

        if (from.HasValue)
            query = query.Where(x => x.PublishedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.PublishedAt <= to.Value.AddDays(1));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Title, pattern) ||
                EF.Functions.ILike(x.Content, pattern) ||
                x.Attachments.Any(a => EF.Functions.ILike(a.FileName, pattern)));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                id = x.Id,
                title = x.Title,
                content = x.Content,
                category = x.Category,
                importance = x.Importance,
                sourceType = x.SourceType,
                isPinned = x.IsPinned,
                publishedAt = x.PublishedAt,
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt,
                author = new
                {
                    id = x.CreatedBy.Id,
                    fullName = x.CreatedBy.FullName,
                    avatarUrl = x.CreatedBy.AvatarUrl
                },
                attachments = x.Attachments
                    .OrderBy(a => a.UploadedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        fileName = a.FileName,
                        fileUrl = a.FileUrl,
                        mimeType = a.MimeType
                    })
                    .ToList(),
                commentsCount = x.Comments.Count
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            total,
            page,
            pageSize,
            hasMore = page * pageSize < total
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _db.NewsPosts
            .AsNoTracking()
            .Include(x => x.CreatedBy)
            .Include(x => x.Attachments)
            .Include(x => x.Comments)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                id = x.Id,
                title = x.Title,
                content = x.Content,
                category = x.Category,
                importance = x.Importance,
                sourceType = x.SourceType,
                isPinned = x.IsPinned,
                publishedAt = x.PublishedAt,
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt,
                author = new
                {
                    id = x.CreatedBy.Id,
                    fullName = x.CreatedBy.FullName,
                    avatarUrl = x.CreatedBy.AvatarUrl
                },
                attachments = x.Attachments
                    .OrderBy(a => a.UploadedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        fileName = a.FileName,
                        fileUrl = a.FileUrl,
                        mimeType = a.MimeType
                    })
                    .ToList(),
                commentsCount = x.Comments.Count
            })
            .FirstOrDefaultAsync();

        return item == null ? NotFound() : Ok(item);
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var exists = await _db.NewsPosts.AnyAsync(x => x.Id == id);
        if (!exists) return NotFound();

        var comments = await _db.NewsComments
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.NewsPostId == id)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.Id,
                content = x.Content,
                isEdited = x.IsEdited,
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt,
                user = new
                {
                    id = x.User.Id,
                    fullName = x.User.FullName,
                    avatarUrl = x.User.AvatarUrl
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNewsDto dto)
    {
        if (!IsNewsAdmin)
            return Forbid();

        var title = dto.Title?.Trim();
        var content = dto.Content?.Trim();

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
            return BadRequest("Заголовок и текст обязательны");

        var author = await _db.Users.FindAsync(CurrentUserId);
        if (author == null) return NotFound("Пользователь не найден");

        var post = new NewsPost
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = content,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "Announcement" : dto.Category.Trim(),
            Importance = string.IsNullOrWhiteSpace(dto.Importance) ? "Normal" : dto.Importance.Trim(),
            SourceType = string.IsNullOrWhiteSpace(dto.SourceType) ? "ManagementCompany" : dto.SourceType.Trim(),
            IsPinned = dto.IsPinned,
            CreatedById = author.Id,
            PublishedAt = dto.PublishedAt ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.NewsPosts.Add(post);
        await _db.SaveChangesAsync();

        return Ok(new { id = post.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsDto dto)
    {
        if (!await IsAuthorOrAdminAsync(id))
            return Forbid();

        var post = await _db.NewsPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (post == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Title))
            post.Title = dto.Title.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Content))
            post.Content = dto.Content.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Category))
            post.Category = dto.Category;

        if (!string.IsNullOrWhiteSpace(dto.Importance))
            post.Importance = dto.Importance;

        if (!string.IsNullOrWhiteSpace(dto.SourceType))
            post.SourceType = dto.SourceType;

        if (dto.IsPinned.HasValue)
            post.IsPinned = dto.IsPinned.Value;

        if (dto.PublishedAt.HasValue)
            post.PublishedAt = dto.PublishedAt.Value;

        post.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!await IsAuthorOrAdminAsync(id))
            return Forbid();

        var post = await _db.NewsPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (post == null) return NotFound();

        _db.NewsPosts.Remove(post);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPost("{id}/attachments")]
    public async Task<IActionResult> UploadAttachment(Guid id, IFormFile file)
    {
        if (!await IsAuthorOrAdminAsync(id))
            return Forbid();

        if (file == null || file.Length == 0)
            return BadRequest("Файл не выбран");

        var postExists = await _db.NewsPosts.AnyAsync(x => x.Id == id);
        if (!postExists) return NotFound();

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "news-files");
        Directory.CreateDirectory(uploadsFolder);

        var ext = Path.GetExtension(file.FileName);
        var storedName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, storedName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new NewsAttachment
        {
            Id = Guid.NewGuid(),
            NewsPostId = id,
            FileName = file.FileName,
            FileUrl = $"/news-files/{storedName}",
            MimeType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        _db.NewsAttachments.Add(attachment);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = attachment.Id,
            fileName = attachment.FileName,
            fileUrl = attachment.FileUrl,
            mimeType = attachment.MimeType
        });
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateNewsCommentDto dto)
    {
        var postExists = await _db.NewsPosts.AnyAsync(x => x.Id == id);
        if (!postExists) return NotFound();

        var content = dto.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content))
            return BadRequest("Комментарий пустой");

        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        var comment = new NewsComment
        {
            Id = Guid.NewGuid(),
            NewsPostId = id,
            UserId = user.Id,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.NewsComments.Add(comment);
        await _db.SaveChangesAsync();

        return Ok(new { id = comment.Id });
    }

    [HttpPut("comments/{commentId}")]
    public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] CreateNewsCommentDto dto)
    {
        var comment = await _db.NewsComments.FirstOrDefaultAsync(x => x.Id == commentId);
        if (comment == null) return NotFound();

        if (comment.UserId != CurrentUserId && !IsNewsAdmin)
            return Forbid();

        var content = dto.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content))
            return BadRequest("Комментарий пустой");

        comment.Content = content;
        comment.IsEdited = true;
        comment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var comment = await _db.NewsComments.FirstOrDefaultAsync(x => x.Id == commentId);
        if (comment == null) return NotFound();

        if (comment.UserId != CurrentUserId && !IsNewsAdmin)
            return Forbid();

        _db.NewsComments.Remove(comment);
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    public sealed class CreateNewsDto
    {
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public string Category { get; set; } = "Announcement";
        public string Importance { get; set; } = "Normal";
        public string SourceType { get; set; } = "ManagementCompany";
        public bool IsPinned { get; set; }
        public DateTime? PublishedAt { get; set; }
    }

    public sealed class UpdateNewsDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Category { get; set; }
        public string? Importance { get; set; }
        public string? SourceType { get; set; }
        public bool? IsPinned { get; set; }
        public DateTime? PublishedAt { get; set; }
    }

    public sealed class CreateNewsCommentDto
    {
        public string Content { get; set; } = "";
    }
}