namespace MyHome.Domain.Entities;

public class Chat
{
    public Guid Id { get; set; }

    // House, Entrance, Direct, Request
    public string Type { get; set; } = null!;

    public string? Name { get; set; }
    public string? Description { get; set; }

    // код для входа в группу по ссылке
    public string? InviteCode { get; set; }

    public string? AvatarUrl { get; set; }

    // если чат привязан к заявке
    public Guid? ServiceRequestId { get; set; }
    public ServiceRequest? ServiceRequest { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = [];
    public ICollection<ChatMember> Members { get; set; } = [];
}
