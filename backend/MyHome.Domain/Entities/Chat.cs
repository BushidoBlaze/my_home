namespace MyHome.Domain.Entities;

public class Chat
{
    public Guid Id { get; set; }

    // Тип чата: House, Entrance, Direct, Request
    public string Type { get; set; } = null!;

    // Название чата
    public string? Name { get; set; }

    // Описание группы
    public string? Description { get; set; }

    // Код приглашения
    public string? InviteCode { get; set; }

    // Аватар группы/чата
    public string? AvatarUrl { get; set; }

    // Для чатов по заявкам
    public Guid? ServiceRequestId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигационные свойства
    public ICollection<ChatMessage> Messages { get; set; } = [];
    public ICollection<ChatMember> Members { get; set; } = [];
}