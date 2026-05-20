namespace MyHome.Domain.Entities;

public class NewsPost
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;

    public string Category { get; set; } = "Announcement";
    public string Importance { get; set; } = "Normal";
    public string SourceType { get; set; } = "ManagementCompany";

    public bool IsPinned { get; set; } = false;

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<NewsAttachment> Attachments { get; set; } = [];
    public ICollection<NewsComment> Comments { get; set; } = [];
}