namespace MyHome.Domain.Entities;

public class ChatMember
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // Member / Admin
    public string Role { get; set; } = "Member";

    public bool IsMuted { get; set; } = false;

    // до какого момента дочитал — для непрочитанных
    public DateTime? LastReadAt { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
