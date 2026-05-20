namespace MyHome.Domain.Entities;

public class PollVote
{
    public Guid Id { get; set; }
    public Guid PollId { get; set; }
    public Poll Poll { get; set; } = null!;
    public Guid OptionId { get; set; }
    public PollOption Option { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
