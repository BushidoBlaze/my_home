namespace MyHome.Domain.Entities;

public class NewsComment
{
    public Guid Id { get; set; }

    public Guid NewsPostId { get; set; }
    public NewsPost NewsPost { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Content { get; set; } = null!;
    public bool IsEdited { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}