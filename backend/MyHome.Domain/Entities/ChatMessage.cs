namespace MyHome.Domain.Entities;

public class ChatMessage
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public string Text { get; set; } = "";

    // Тип: text, image, file, geo, voice
    public string Type { get; set; } = "text";

    // URL файла/фото/голосового (если есть)
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }

    // Геолокация
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Ответ на сообщение
    public Guid? ReplyToId { get; set; }
    public ChatMessage? ReplyTo { get; set; }

    // Закреплено
    public bool IsPinned { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Реакции
    public ICollection<MessageReaction> Reactions { get; set; } = [];
}