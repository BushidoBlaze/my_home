namespace MyHome.Domain.Entities;

public class NewsAttachment
{
    public Guid Id { get; set; }

    public Guid NewsPostId { get; set; }
    public NewsPost NewsPost { get; set; } = null!;

    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string MimeType { get; set; } = "application/octet-stream";

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}