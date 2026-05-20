namespace MyHome.Domain.Entities;

public class MessageReaction
{
    public Guid Id { get; set; }
    public Guid MessageId { get; set; }
    public ChatMessage Message { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // Эмодзи реакции
    public string Emoji { get; set; } = null!;
}