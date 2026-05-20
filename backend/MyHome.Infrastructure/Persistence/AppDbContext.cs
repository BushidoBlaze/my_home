using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;

namespace MyHome.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Apartment> Apartments => Set<Apartment>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<ChatMember> ChatMembers => Set<ChatMember>();
    public DbSet<MessageReaction> MessageReactions => Set<MessageReaction>();
    public DbSet<NewsPost> NewsPosts => Set<NewsPost>();
    public DbSet<NewsAttachment> NewsAttachments => Set<NewsAttachment>();
    public DbSet<NewsComment> NewsComments => Set<NewsComment>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
    public DbSet<ServiceReview> ServiceReviews => Set<ServiceReview>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<UtilityBill> UtilityBills => Set<UtilityBill>();
    public DbSet<MeterReading> MeterReadings => Set<MeterReading>();
    public DbSet<AutoPaymentSetting> AutoPaymentSettings => Set<AutoPaymentSetting>();
    public DbSet<Poll> Polls => Set<Poll>();
    public DbSet<PollOption> PollOptions => Set<PollOption>();
    public DbSet<PollVote> PollVotes => Set<PollVote>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<UserApartment> UserApartments => Set<UserApartment>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Apartment>()
            .HasOne(a => a.Resident)
            .WithMany()
            .HasForeignKey(a => a.ResidentId);

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(r => r.Resident)
            .WithMany()
            .HasForeignKey(r => r.ResidentId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserSettings>()
            .HasIndex(s => s.UserId)
            .IsUnique();

        // InviteCode null
        modelBuilder.Entity<Chat>()
            .HasIndex(c => c.InviteCode)
            .IsUnique()
            .HasFilter("\"InviteCode\" IS NOT NULL");

        modelBuilder.Entity<ChatMember>()
            .HasIndex(m => new { m.ChatId, m.UserId })
            .IsUnique();

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.ReplyTo)
            .WithMany()
            .HasForeignKey(m => m.ReplyToId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Chat)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMember>()
            .HasOne(m => m.Chat)
            .WithMany(c => c.Members)
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMember>()
            .HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MessageReaction>()
            .HasIndex(r => new { r.MessageId, r.UserId, r.Emoji })
            .IsUnique();

        modelBuilder.Entity<MessageReaction>()
            .HasOne(r => r.Message)
            .WithMany(m => m.Reactions)
            .HasForeignKey(r => r.MessageId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MessageReaction>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NewsPost>()
            .HasOne(n => n.CreatedBy)
            .WithMany()
            .HasForeignKey(n => n.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NewsAttachment>()
            .HasOne(a => a.NewsPost)
            .WithMany(n => n.Attachments)
            .HasForeignKey(a => a.NewsPostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NewsComment>()
            .HasOne(c => c.NewsPost)
            .WithMany(n => n.Comments)
            .HasForeignKey(c => c.NewsPostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NewsComment>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Service>()
            .HasOne(s => s.Provider)
            .WithMany()
            .HasForeignKey(s => s.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ServiceOrder>()
            .HasOne(o => o.Service)
            .WithMany(s => s.Orders)
            .HasForeignKey(o => o.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServiceOrder>()
            .HasOne(o => o.Resident)
            .WithMany()
            .HasForeignKey(o => o.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServiceReview>()
            .HasOne(r => r.Service)
            .WithMany(s => s.Reviews)
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServiceReview>()
            .HasOne(r => r.Resident)
            .WithMany()
            .HasForeignKey(r => r.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServiceReview>()
            .HasIndex(r => new { r.ServiceId, r.ResidentId })
            .IsUnique();

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.RelatedRequest)
            .WithMany()
            .HasForeignKey(n => n.RelatedRequestId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });

        modelBuilder.Entity<SupportTicket>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SupportTicket>()
            .HasIndex(t => new { t.UserId, t.Type, t.CreatedAt });

        modelBuilder.Entity<UtilityBill>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UtilityBill>()
            .HasIndex(b => new { b.UserId, b.Status, b.DueDate });

        modelBuilder.Entity<MeterReading>()
            .HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MeterReading>()
            .HasIndex(m => new { m.UserId, m.MeterType, m.ReadingDate });

        modelBuilder.Entity<AutoPaymentSetting>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AutoPaymentSetting>()
            .HasIndex(a => a.UserId)
            .IsUnique();

        // Polls
        modelBuilder.Entity<Poll>()
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PollOption>()
            .HasOne(o => o.Poll)
            .WithMany(p => p.Options)
            .HasForeignKey(o => o.PollId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PollVote>()
            .HasOne(v => v.Poll)
            .WithMany(p => p.Votes)
            .HasForeignKey(v => v.PollId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PollVote>()
            .HasOne(v => v.Option)
            .WithMany(o => o.Votes)
            .HasForeignKey(v => v.OptionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PollVote>()
            .HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PollVote>()
            .HasIndex(v => new { v.PollId, v.UserId })
            .IsUnique(); // один голос на опрос

        // Subscriptions
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Subscription>()
            .HasIndex(s => s.UserId)
            .IsUnique(); // одна подписка на пользователя

        // UserApartments
        modelBuilder.Entity<UserApartment>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}