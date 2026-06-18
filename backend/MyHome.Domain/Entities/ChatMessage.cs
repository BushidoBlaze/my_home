namespace MyHome.Domain.Entities;

public class ChatMessage
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public string Text { get; set; } = "";

    // text, image, file, geo, voice
    public string Type { get; set; } = "text";

    public string? FileUrl { get; set; }
    public string? FileName { get; set; }

    // координаты для гео-сообщений
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // ответ на другое сообщение
    public Guid? ReplyToId { get; set; }
    public ChatMessage? ReplyTo { get; set; }

    public bool IsPinned { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MessageReaction> Reactions { get; set; } = [];
}
