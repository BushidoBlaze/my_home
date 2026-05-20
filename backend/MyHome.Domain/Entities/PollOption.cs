namespace MyHome.Domain.Entities;

public class PollOption
{
    public Guid Id { get; set; }
    public Guid PollId { get; set; }
    public Poll Poll { get; set; } = null!;
    public string Text { get; set; } = null!;
    public ICollection<PollVote> Votes { get; set; } = [];
}
