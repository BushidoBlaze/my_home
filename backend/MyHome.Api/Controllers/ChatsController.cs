using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MyHome.Api.Hubs;
using MyHome.Api.Security;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/chats")]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IHubContext<ChatHub> _chatHub;
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> DirectChatLocks = new();

    public ChatsController(AppDbContext db, IWebHostEnvironment env, IHubContext<ChatHub> chatHub)
    {
        _db = db;
        _env = env;
        _chatHub = chatHub;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<ChatMember?> GetMyMemberAsync(Guid chatId)
    {
        return await _db.ChatMembers.FirstOrDefaultAsync(m =>
            m.ChatId == chatId && m.UserId == CurrentUserId);
    }

    private async Task<bool> CanManageAsync(Guid chatId)
    {
        var member = await GetMyMemberAsync(chatId);
        return member != null && member.Role == "Admin";
    }

    private async Task<bool> IsMemberAsync(Guid chatId)
    {
        return await _db.ChatMembers.AnyAsync(m =>
            m.ChatId == chatId && m.UserId == CurrentUserId);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyChats()
    {
        var chats = await _db.Chats
            .Where(c => c.Members.Any(m => m.UserId == CurrentUserId))
            .Select(c => new
            {
                id = c.Id,
                name = c.Name,
                type = c.Type,
                description = c.Description,
                avatarUrl = c.AvatarUrl,
                inviteCode = c.InviteCode,
                createdAt = c.CreatedAt,
                currentUserRole = c.Members
                    .Where(m => m.UserId == CurrentUserId)
                    .Select(m => m.Role)
                    .FirstOrDefault(),
                isMuted = c.Members
                    .Where(m => m.UserId == CurrentUserId)
                    .Select(m => m.IsMuted)
                    .FirstOrDefault(),
                lastMessage = c.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new
                    {
                        text = m.Text,
                        type = m.Type,
                        createdAt = m.CreatedAt,
                        senderId = m.SenderId,
                        senderName = m.Sender.FullName
                    })
                    .FirstOrDefault(),
                membersCount = c.Members.Count()
            })
            .ToListAsync();

        return Ok(chats);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetChatDetails(Guid id)
    {
        if (!await IsMemberAsync(id)) return NotFound();

        var chat = await _db.Chats
            .Where(c => c.Id == id)
            .Select(c => new
            {
                id = c.Id,
                name = c.Name,
                type = c.Type,
                description = c.Description,
                avatarUrl = c.AvatarUrl,
                inviteCode = c.InviteCode,
                createdAt = c.CreatedAt,
                currentUserRole = c.Members
                    .Where(m => m.UserId == CurrentUserId)
                    .Select(m => m.Role)
                    .FirstOrDefault(),
                isMuted = c.Members
                    .Where(m => m.UserId == CurrentUserId)
                    .Select(m => m.IsMuted)
                    .FirstOrDefault(),
                membersCount = c.Members.Count()
            })
            .FirstOrDefaultAsync();

        return chat == null ? NotFound() : Ok(chat);
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        if (!await IsMemberAsync(id)) return NotFound();

        var members = await _db.ChatMembers
            .Where(m => m.ChatId == id)
            .OrderBy(m => m.JoinedAt)
            .Select(m => new
            {
                id = m.Id,
                userId = m.UserId,
                fullName = m.User.FullName,
                email = m.User.Email,
                avatarUrl = m.User.AvatarUrl,
                role = m.Role,
                isMuted = m.IsMuted,
                joinedAt = m.JoinedAt
            })
            .ToListAsync();

        return Ok(members);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateChat(Guid id, [FromBody] UpdateChatDto dto)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound();

        if (chat.Type == "Direct")
        {
            if (!await IsMemberAsync(id)) return NotFound();
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Название личного чата обязательно");

            chat.Name = dto.Name.Trim();
            await _db.SaveChangesAsync();
            return await GetChatDetails(id);
        }

        if (!await CanManageAsync(id)) return Forbid();

        if (!string.IsNullOrWhiteSpace(dto.Name))
            chat.Name = dto.Name.Trim();

        chat.Description = string.IsNullOrWhiteSpace(dto.Description)
            ? null
            : dto.Description.Trim();

        await _db.SaveChangesAsync();

        return await GetChatDetails(id);
    }

    [HttpPost("{id}/invite-link")]
    public async Task<IActionResult> GenerateInviteLink(Guid id)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound();

        if (chat.Type == "Direct") return BadRequest("Для личного чата ссылка не нужна");
        if (!await CanManageAsync(id)) return Forbid();

        if (string.IsNullOrWhiteSpace(chat.InviteCode))
        {
            chat.InviteCode = Guid.NewGuid().ToString("N");
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            inviteCode = chat.InviteCode,
            inviteUrl = $"{Request.Scheme}://{Request.Host}/invite/{chat.InviteCode}"
        });
    }

    [HttpPost("join/{code}")]
    public async Task<IActionResult> JoinByInvite(string code)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.InviteCode == code);
        if (chat == null) return NotFound();

        if (await IsMemberAsync(chat.Id))
            return Ok(new { chatId = chat.Id });

        _db.ChatMembers.Add(new ChatMember
        {
            Id = Guid.NewGuid(),
            ChatId = chat.Id,
            UserId = CurrentUserId,
            Role = "Member",
            IsMuted = false
        });

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Ok(new { chatId = chat.Id });
        }
        return Ok(new { chatId = chat.Id });
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberDto dto)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound();

        if (chat.Type == "Direct") return BadRequest("В личный чат нельзя добавлять участников");
        if (!await CanManageAsync(id)) return Forbid();

        var email = dto.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Email обязателен");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        // Не раскрываем существование e-mail в системе через разные ответы.
        if (user == null) return Ok(new { ok = true, exists = true });

        var exists = await _db.ChatMembers.AnyAsync(m => m.ChatId == id && m.UserId == user.Id);
        if (exists) return Ok(new { ok = true, exists = true });

        _db.ChatMembers.Add(new ChatMember
        {
            Id = Guid.NewGuid(),
            ChatId = id,
            UserId = user.Id,
            Role = "Member",
            IsMuted = false
        });

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Ok(new { ok = true, exists = true });
        }
        return Ok(new { ok = true });
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound();
        if (chat.Type == "Direct") return BadRequest("Для личного чата удаление участников недоступно");
        if (!await CanManageAsync(id)) return Forbid();

        var me = await GetMyMemberAsync(id);
        if (me == null) return Forbid();
        if (me.UserId == userId) return BadRequest("Нельзя удалить себя из группы этим методом");

        var member = await _db.ChatMembers.FirstOrDefaultAsync(m => m.ChatId == id && m.UserId == userId);
        if (member == null) return NotFound();

        _db.ChatMembers.Remove(member);
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpPut("{id}/members/{userId}/role")]
    public async Task<IActionResult> SetMemberRole(Guid id, Guid userId, [FromBody] SetMemberRoleDto dto)
    {
        if (!await CanManageAsync(id)) return Forbid();

        var member = await _db.ChatMembers.FirstOrDefaultAsync(m => m.ChatId == id && m.UserId == userId);
        if (member == null) return NotFound();

        var role = dto.Role?.Trim();
        if (string.IsNullOrWhiteSpace(role))
            return BadRequest("Роль обязательна");

        if (role != "Member" && role != "Admin")
            return BadRequest("Некорректная роль");

        member.Role = role;
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPut("{id}/mute")]
    public async Task<IActionResult> SetMute(Guid id, [FromBody] SetMuteDto dto)
    {
        var member = await GetMyMemberAsync(id);
        if (member == null) return NotFound();

        member.IsMuted = dto.IsMuted;
        await _db.SaveChangesAsync();

        return Ok(new { ok = true, isMuted = member.IsMuted });
    }

    [HttpPost("{id}/leave")]
    public async Task<IActionResult> LeaveChat(Guid id)
    {
        var member = await GetMyMemberAsync(id);
        if (member == null) return NotFound();

        _db.ChatMembers.Remove(member);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, [FromQuery] int page = 1)
    {
        if (!await IsMemberAsync(id)) return NotFound();
        if (page < 1) return BadRequest("page must be greater than 0");

        var pageSize = 50;

        var messages = await _db.ChatMessages
            .Where(m => m.ChatId == id)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                id = m.Id,
                text = m.Text,
                type = m.Type,
                fileUrl = m.FileUrl,
                fileName = m.FileName,
                latitude = m.Latitude,
                longitude = m.Longitude,
                isPinned = m.IsPinned,
                isRead = m.SenderId == CurrentUserId
                    && !_db.ChatMembers.Any(cm =>
                        cm.ChatId == id &&
                        cm.UserId != CurrentUserId &&
                        (cm.LastReadAt == null || cm.LastReadAt < m.CreatedAt)),
                createdAt = m.CreatedAt,
                replyToId = m.ReplyToId,
                sender = new { id = m.Sender.Id, fullName = m.Sender.FullName, avatarUrl = m.Sender.AvatarUrl },
                reactions = m.Reactions
                    .GroupBy(r => r.Emoji)
                    .Select(g => new { emoji = g.Key, count = g.Count() })
            })
            .ToListAsync();

        messages.Reverse();
        return Ok(messages);
    }

    [HttpGet("{id}/messages/search")]
    public async Task<IActionResult> SearchMessages(Guid id, [FromQuery] string query, [FromQuery] int take = 50)
    {
        if (!await IsMemberAsync(id)) return NotFound();

        var search = query?.Trim();
        if (string.IsNullOrWhiteSpace(search))
            return Ok(Array.Empty<object>());

        take = Math.Clamp(take, 1, 100);
        var pattern = $"%{search}%";

        var messages = await _db.ChatMessages
            .Where(m => m.ChatId == id)
            .Where(m =>
                EF.Functions.ILike(m.Text, pattern) ||
                (m.FileName != null && EF.Functions.ILike(m.FileName, pattern)))
            .OrderByDescending(m => m.CreatedAt)
            .Take(take)
            .Select(m => new
            {
                id = m.Id,
                text = m.Text,
                type = m.Type,
                fileUrl = m.FileUrl,
                fileName = m.FileName,
                latitude = m.Latitude,
                longitude = m.Longitude,
                isPinned = m.IsPinned,
                isRead = m.SenderId == CurrentUserId
                    && !_db.ChatMembers.Any(cm =>
                        cm.ChatId == id &&
                        cm.UserId != CurrentUserId &&
                        (cm.LastReadAt == null || cm.LastReadAt < m.CreatedAt)),
                createdAt = m.CreatedAt,
                replyToId = m.ReplyToId,
                sender = new { id = m.Sender.Id, fullName = m.Sender.FullName, avatarUrl = m.Sender.AvatarUrl },
                reactions = m.Reactions
                    .GroupBy(r => r.Emoji)
                    .Select(g => new { emoji = g.Key, count = g.Count() })
            })
            .ToListAsync();

        messages.Reverse();
        return Ok(messages);
    }

    [HttpGet("{id}/pinned")]
    public async Task<IActionResult> GetPinned(Guid id)
    {
        if (!await IsMemberAsync(id)) return NotFound();

        var pinned = await _db.ChatMessages
            .Where(m => m.ChatId == id && m.IsPinned)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                id = m.Id,
                text = m.Text,
                type = m.Type,
                createdAt = m.CreatedAt,
                isRead = m.SenderId == CurrentUserId
                    && !_db.ChatMembers.Any(cm =>
                        cm.ChatId == id &&
                        cm.UserId != CurrentUserId &&
                        (cm.LastReadAt == null || cm.LastReadAt < m.CreatedAt)),
                sender = new { fullName = m.Sender.FullName }
            })
            .ToListAsync();

        return Ok(pinned);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id, [FromBody] MarkReadDto? dto = null)
    {
        var member = await GetMyMemberAsync(id);
        if (member == null) return NotFound();

        DateTime readAt;
        if (!string.IsNullOrWhiteSpace(dto?.MessageId) && Guid.TryParse(dto.MessageId, out var messageId))
        {
            var message = await _db.ChatMessages
                .Where(m => m.ChatId == id && m.Id == messageId)
                .Select(m => new { m.CreatedAt })
                .FirstOrDefaultAsync();
            if (message == null) return NotFound("Сообщение не найдено");
            readAt = message.CreatedAt;
        }
        else
        {
            readAt = await _db.ChatMessages
                .Where(m => m.ChatId == id)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            if (readAt == default)
                readAt = DateTime.UtcNow;
        }

        if (member.LastReadAt == null || member.LastReadAt < readAt)
        {
            member.LastReadAt = readAt;
            await _db.SaveChangesAsync();
        }

        await _chatHub.Clients.Group(id.ToString()).SendAsync("ChatReadUpdated", new
        {
            chatId = id.ToString(),
            userId = CurrentUserId.ToString(),
            readAt = readAt.ToString("o")
        });

        return Ok(new { ok = true, readAt });
    }

    [HttpPost("init")]
    public async Task<IActionResult> InitDefaultChats()
    {
        var userId = CurrentUserId;

        async Task<string> PickRole(Guid chatId)
        {
            var hasMembers = await _db.ChatMembers.AnyAsync(m => m.ChatId == chatId);
            return hasMembers ? "Member" : "Admin";
        }

        var houseChat = await _db.Chats.FirstOrDefaultAsync(c => c.Type == "House");
        if (houseChat == null)
        {
            houseChat = new Chat
            {
                Id = Guid.NewGuid(),
                Type = "House",
                Name = "Общий чат дома",
                Description = null
            };
            _db.Chats.Add(houseChat);
        }

        var alreadyMember = await _db.ChatMembers
            .AnyAsync(m => m.ChatId == houseChat.Id && m.UserId == userId);

        if (!alreadyMember)
        {
            _db.ChatMembers.Add(new ChatMember
            {
                Id = Guid.NewGuid(),
                ChatId = houseChat.Id,
                UserId = userId,
                Role = await PickRole(houseChat.Id),
                IsMuted = false
            });
        }

        var entranceChat = await _db.Chats.FirstOrDefaultAsync(c => c.Type == "Entrance");
        if (entranceChat == null)
        {
            entranceChat = new Chat
            {
                Id = Guid.NewGuid(),
                Type = "Entrance",
                Name = "Чат подъезда",
                Description = null
            };
            _db.Chats.Add(entranceChat);
        }

        var alreadyInEntrance = await _db.ChatMembers
            .AnyAsync(m => m.ChatId == entranceChat.Id && m.UserId == userId);

        if (!alreadyInEntrance)
        {
            _db.ChatMembers.Add(new ChatMember
            {
                Id = Guid.NewGuid(),
                ChatId = entranceChat.Id,
                UserId = userId,
                Role = await PickRole(entranceChat.Id),
                IsMuted = false
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { houseChatId = houseChat.Id, entranceChatId = entranceChat.Id });
    }

    [HttpPost("direct/{targetUserId}")]
    public async Task<IActionResult> CreateDirectChat(Guid targetUserId)
    {
        var currentId = CurrentUserId;
        if (targetUserId == currentId)
            return BadRequest("Нельзя создать личный чат с самим собой");

        var targetExists = await _db.Users.AnyAsync(u => u.Id == targetUserId);
        if (!targetExists)
            return NotFound("Пользователь не найден");

        var lockKey = currentId.CompareTo(targetUserId) < 0
            ? $"{currentId}:{targetUserId}"
            : $"{targetUserId}:{currentId}";
        var directChatLock = DirectChatLocks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));
        await directChatLock.WaitAsync();

        try
        {
            var existing = await _db.Chats
                .Where(c => c.Type == "Direct" &&
                            c.Members.Any(m => m.UserId == currentId) &&
                            c.Members.Any(m => m.UserId == targetUserId))
                .FirstOrDefaultAsync();

            if (existing != null)
                return Ok(new { chatId = existing.Id });

            var chat = new Chat
            {
                Id = Guid.NewGuid(),
                Type = "Direct",
                Name = "Личный чат"
            };

            _db.Chats.Add(chat);
            _db.ChatMembers.Add(new ChatMember { Id = Guid.NewGuid(), ChatId = chat.Id, UserId = currentId, Role = "Member", IsMuted = false });
            _db.ChatMembers.Add(new ChatMember { Id = Guid.NewGuid(), ChatId = chat.Id, UserId = targetUserId, Role = "Member", IsMuted = false });

            await _db.SaveChangesAsync();
            return Ok(new { chatId = chat.Id });
        }
        finally
        {
            directChatLock.Release();
        }
    }

    [HttpPost("group")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
    {
        var name = dto.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Название группы обязательно");

        var chat = new Chat
        {
            Id = Guid.NewGuid(),
            Type = "Group",
            Name = name,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim()
        };
        _db.Chats.Add(chat);

        var memberIds = new HashSet<Guid> { CurrentUserId };
        var emails = (dto.MemberEmails ?? []).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct().ToList();
        if (emails.Count > 0)
        {
            var users = await _db.Users.Where(u => emails.Contains(u.Email)).Select(u => new { u.Id, u.Email }).ToListAsync();
            foreach (var user in users)
            {
                memberIds.Add(user.Id);
            }
        }

        foreach (var userId in memberIds)
        {
            _db.ChatMembers.Add(new ChatMember
            {
                Id = Guid.NewGuid(),
                ChatId = chat.Id,
                UserId = userId,
                Role = userId == CurrentUserId ? "Admin" : "Member",
                IsMuted = false
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { chatId = chat.Id });
    }

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? query = null)
    {
        var q = (query ?? string.Empty).Trim().ToLower();

        // Анти-enumeration: без минимум 2 символов не отдаём список — иначе можно
        // последовательным перебором "a","b","c",... вытянуть всю базу.
        if (q.Length < 2) return Ok(Array.Empty<object>());

        var usersQuery = _db.Users.Where(u => u.Id != CurrentUserId);
        usersQuery = usersQuery.Where(u =>
            u.FullName.ToLower().Contains(q) ||
            u.Email.ToLower().Contains(q));

        var users = await usersQuery
            .OrderBy(u => u.FullName)
            .Take(20)
            .Select(u => new
            {
                id = u.Id,
                fullName = u.FullName,
                email = u.Email,
                avatarUrl = u.AvatarUrl
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("{id}/file")]
    public async Task<IActionResult> UploadFile(Guid id, IFormFile file)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound("Чат не найден");
        if (!await IsMemberAsync(id)) return Forbid();

        var (ok, safeExt, error) = UploadSecurity.Validate(file);
        if (!ok) return BadRequest(error);

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "chat-files");
        Directory.CreateDirectory(uploadsFolder);

        // Имя файла полностью генерим сами — никакого user-controlled пути / расширения.
        var ext = safeExt ?? string.Empty;
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var normalizedExt = ext;
        var imageExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var videoExts = new[] { ".mp4", ".webm", ".mov", ".mkv" };
        var audioExts = new[] { ".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm" };

        var contentType = (file.ContentType ?? string.Empty).ToLowerInvariant();

        var type = imageExts.Contains(normalizedExt) ? "image"
            : contentType.StartsWith("video/") || videoExts.Contains(normalizedExt) ? "video"
            : contentType.StartsWith("audio/") || audioExts.Contains(normalizedExt) ? "voice"
            : "file";

        return Ok(new
        {
            url = $"/chat-files/{fileName}",
            fileName = file.FileName,
            type
        });
    }

    [HttpPost("{id}/avatar")]
    public async Task<IActionResult> UploadGroupAvatar(Guid id, IFormFile file)
    {
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.Id == id);
        if (chat == null) return NotFound();
        if (chat.Type == "Direct") return BadRequest("Для личного чата аватар недоступен");
        if (!await CanManageAsync(id)) return Forbid();

        var (ok, safeExt, error) = UploadSecurity.Validate(file);
        if (!ok) return BadRequest(error);

        // Аватар чата — только картинки.
        var allowedImage = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (string.IsNullOrEmpty(safeExt) || !allowedImage.Contains(safeExt))
            return BadRequest("Допустимые форматы: jpg, jpeg, png, webp");

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "chat-avatars");
        Directory.CreateDirectory(uploadsFolder);

        var ext = safeExt;
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        chat.AvatarUrl = $"/chat-avatars/{fileName}";
        await _db.SaveChangesAsync();
        return Ok(new { url = chat.AvatarUrl });
    }

    public sealed class UpdateChatDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
    }

    public sealed class AddMemberDto
    {
        public string Email { get; set; } = "";
    }

    public sealed class SetMemberRoleDto
    {
        public string Role { get; set; } = "Member";
    }

    public sealed class SetMuteDto
    {
        public bool IsMuted { get; set; }
    }

    public sealed class MarkReadDto
    {
        public string? MessageId { get; set; }
    }

    public sealed class CreateGroupDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public List<string>? MemberEmails { get; set; }
    }
}