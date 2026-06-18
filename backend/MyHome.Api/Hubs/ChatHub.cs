using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private const int MaxMessageLength = 4000;
    private const int MaxFileNameLength = 256;
    private const int MaxEmojiLength = 16;

    private readonly AppDbContext _db;

    // онлайн-пользователи: userId -> его connectionId-ы
    private static readonly Dictionary<string, HashSet<string>> UserConnections = new();
    private static readonly object Lock = new();

    public ChatHub(AppDbContext db) => _db = db;

    private Guid? GetCurrentUserId()
    {
        var raw = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? Context.User?.FindFirstValue("nameid")
                  ?? Context.User?.FindFirstValue("sub");
        return Guid.TryParse(raw, out var userId) ? userId : null;
    }

    private async Task<bool> IsMemberAsync(Guid chatId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null) return false;
        return await _db.ChatMembers.AnyAsync(m =>
            m.ChatId == chatId && m.UserId == currentUserId.Value);
    }

    private async Task<bool> IsAdminAsync(Guid chatId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null) return false;
        return await _db.ChatMembers.AnyAsync(m =>
            m.ChatId == chatId &&
            m.UserId == currentUserId.Value &&
            m.Role == "Admin");
    }

    // Пользователь подключился — уведомляем всех об онлайн статусе
    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        if (userId != null)
        {
            var userIdStr = userId.Value.ToString();

            lock (Lock)
            {
                if (!UserConnections.ContainsKey(userIdStr))
                    UserConnections[userIdStr] = new HashSet<string>();
                UserConnections[userIdStr].Add(Context.ConnectionId);
            }

            await Clients.All.SendAsync("UserStatusChanged", new
            {
                userId = userIdStr,
                isOnline = true
            });

            List<string> onlineIds;
            lock (Lock) { onlineIds = UserConnections.Keys.ToList(); }

            var snapshot = onlineIds.Select(id => new { userId = id, isOnline = true }).ToList();
            await Clients.Caller.SendAsync("PresenceSnapshot", snapshot);
        }

        await base.OnConnectedAsync();
    }

    // Пользователь отключился
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetCurrentUserId();
        if (userId != null)
        {
            var userIdStr = userId.Value.ToString();
            bool isFullyOffline;

            lock (Lock)
            {
                if (UserConnections.TryGetValue(userIdStr, out var connections))
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0) UserConnections.Remove(userIdStr);
                }
                isFullyOffline = !UserConnections.ContainsKey(userIdStr);
            }

            if (isFullyOffline)
            {
                await Clients.All.SendAsync("UserStatusChanged", new
                {
                    userId = userIdStr,
                    isOnline = false,
                    lastSeen = DateTime.UtcNow.ToString("o")
                });
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Подключиться к группе чата
    public async Task JoinChat(string chatId)
    {
        if (!Guid.TryParse(chatId, out var id)) return;
        if (!await IsMemberAsync(id)) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
    }

    // Отключиться от группы чата
    public async Task LeaveChat(string chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
    }

    // Отправить сообщение
    public async Task SendMessage(
        string chatId,
        string text,
        string? replyToId = null,
        string? fileUrl = null,
        string? fileName = null,
        string? type = null)
    {
        if (!Guid.TryParse(chatId, out var chatGuid))
            throw new HubException("Некорректный chatId");

        var userId = GetCurrentUserId();
        if (userId == null)
            throw new HubException("Пользователь не авторизован");

        if (string.IsNullOrWhiteSpace(text) && string.IsNullOrWhiteSpace(fileUrl))
            throw new HubException("Пустое сообщение");

        // Защита от DoS/spam: лимиты длины.
        if (text != null && text.Length > MaxMessageLength)
            throw new HubException("Сообщение слишком длинное");
        if (fileName != null && fileName.Length > MaxFileNameLength)
            throw new HubException("Слишком длинное имя файла");
        if (fileUrl != null && fileUrl.Length > 1024)
            throw new HubException("Некорректная ссылка на файл");

        // fileUrl должен указывать на нашу же статику, а не куда попало.
        if (!string.IsNullOrEmpty(fileUrl) && !fileUrl.StartsWith("/", StringComparison.Ordinal))
            throw new HubException("Некорректная ссылка на файл");

        if (!await IsMemberAsync(chatGuid))
            throw new HubException("Вы не участник этого чата");

        var user = await _db.Users.FindAsync(userId.Value);
        if (user == null)
            throw new HubException("Пользователь не найден");

        Guid? parsedReplyToId = null;
        if (!string.IsNullOrWhiteSpace(replyToId) && Guid.TryParse(replyToId, out var replyGuid))
        {
            var replyExistsInChat = await _db.ChatMessages.AnyAsync(m => m.Id == replyGuid && m.ChatId == chatGuid);
            if (!replyExistsInChat)
                throw new HubException("Сообщение для ответа не найдено в этом чате");
            parsedReplyToId = replyGuid;
        }

        var resolvedType = string.IsNullOrWhiteSpace(type)
            ? (string.IsNullOrWhiteSpace(fileUrl) ? "text" : "file")
            : type;

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatId = chatGuid,
            SenderId = userId.Value,
            Text = text ?? "",
            Type = resolvedType,
            FileUrl = fileUrl,
            FileName = fileName,
            ReplyToId = parsedReplyToId,
            CreatedAt = DateTime.UtcNow
        };

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();

        await Clients.Group(chatId).SendAsync("ReceiveMessage", new
        {
            id = message.Id.ToString(),
            chatId = chatId,
            text = message.Text,
            type = message.Type,
            fileUrl = message.FileUrl,
            fileName = message.FileName,
            latitude = (double?)null,
            longitude = (double?)null,
            isPinned = false,
            isRead = false,
            createdAt = message.CreatedAt,
            replyToId = message.ReplyToId?.ToString(),
            sender = new
            {
                id = user.Id.ToString(),
                fullName = user.FullName,
                avatarUrl = user.AvatarUrl
            },
            reactions = Array.Empty<object>()
        });
    }

    // Добавить или убрать реакцию
    public async Task AddReaction(string messageId, string emoji)
    {
        if (!Guid.TryParse(messageId, out var msgId)) return;
        if (string.IsNullOrEmpty(emoji) || emoji.Length > MaxEmojiLength) return;

        var msg = await _db.ChatMessages
            .Include(m => m.Chat)
            .FirstOrDefaultAsync(m => m.Id == msgId);

        if (msg == null) return;
        if (!await IsMemberAsync(msg.ChatId)) return;

        var userId = GetCurrentUserId();
        if (userId == null) return;

        var existing = await _db.MessageReactions
            .FirstOrDefaultAsync(r => r.MessageId == msgId && r.UserId == userId.Value && r.Emoji == emoji);

        if (existing != null)
            _db.MessageReactions.Remove(existing);
        else
            _db.MessageReactions.Add(new MessageReaction
            {
                Id = Guid.NewGuid(),
                MessageId = msgId,
                UserId = userId.Value,
                Emoji = emoji
            });

        await _db.SaveChangesAsync();

        var reactions = await _db.MessageReactions
            .Where(r => r.MessageId == msgId)
            .GroupBy(r => r.Emoji)
            .Select(g => new { emoji = g.Key, count = g.Count() })
            .ToListAsync();

        await Clients.Group(msg.ChatId.ToString())
            .SendAsync("ReactionsUpdated", new { messageId, reactions });
    }

    // Редактировать своё сообщение
    public async Task EditMessage(string messageId, string text)
    {
        if (!Guid.TryParse(messageId, out var msgId)) return;

        var msg = await _db.ChatMessages.FirstOrDefaultAsync(m => m.Id == msgId);
        if (msg == null) return;
        if (!await IsMemberAsync(msg.ChatId)) return;

        var userId = GetCurrentUserId();
        if (userId == null || msg.SenderId != userId.Value) return;
        if (string.IsNullOrWhiteSpace(text))
            throw new HubException("Текст сообщения не может быть пустым");
        if (text.Length > MaxMessageLength)
            throw new HubException("Сообщение слишком длинное");

        msg.Text = text.Trim();
        await _db.SaveChangesAsync();

        await Clients.Group(msg.ChatId.ToString())
            .SendAsync("MessageUpdated", new { messageId, text = msg.Text });
    }

    // Удалить сообщение (автор или админ)
    public async Task DeleteMessage(string messageId)
    {
        if (!Guid.TryParse(messageId, out var msgId)) return;

        var msg = await _db.ChatMessages.FirstOrDefaultAsync(m => m.Id == msgId);
        if (msg == null) return;
        if (!await IsMemberAsync(msg.ChatId)) return;

        var userId = GetCurrentUserId();
        if (userId == null) return;

        if (msg.SenderId != userId.Value && !await IsAdminAsync(msg.ChatId)) return;

        _db.ChatMessages.Remove(msg);
        await _db.SaveChangesAsync();

        await Clients.Group(msg.ChatId.ToString())
            .SendAsync("MessageDeleted", new { messageId });
    }

    // Закрепить или открепить сообщение (только админ)
    public async Task PinMessage(string messageId)
    {
        if (!Guid.TryParse(messageId, out var msgId)) return;

        var msg = await _db.ChatMessages.FirstOrDefaultAsync(m => m.Id == msgId);
        if (msg == null) return;
        if (!await IsMemberAsync(msg.ChatId)) return;
        if (!await IsAdminAsync(msg.ChatId)) return;

        msg.IsPinned = !msg.IsPinned;
        await _db.SaveChangesAsync();

        await Clients.Group(msg.ChatId.ToString())
            .SendAsync("MessagePinned", new { messageId, isPinned = msg.IsPinned });
    }

    // Уведомление что пользователь печатает
    public async Task Typing(string chatId)
    {
        if (!Guid.TryParse(chatId, out var chatGuid)) return;
        if (!await IsMemberAsync(chatGuid)) return;

        var userId = GetCurrentUserId();
        if (userId == null) return;

        var user = await _db.Users.FindAsync(userId.Value);
        if (user == null) return;

        await Clients.OthersInGroup(chatId)
            .SendAsync("UserTyping", new { fullName = user.FullName, chatId });
    }
}