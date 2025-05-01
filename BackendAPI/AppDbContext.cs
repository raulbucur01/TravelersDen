using Microsoft.EntityFrameworkCore;
using BackendAPI.Models;
using BackendAPI.Models.LogsForSimilarityUpdates;
using BackendAPI.Models.ItineraryGenerator;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Likes> Likes { get; set; }
    public DbSet<PostMedia> PostMedia { get; set; }
    public DbSet<Saves> Saves { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<CommentLike> CommentLikes { get; set; }
    public DbSet<Accommodation> Accommodations { get; set; }
    public DbSet<TripStep> TripSteps { get; set; }
    public DbSet<TripStepMedia> TripStepMedia { get; set; }
    public DbSet<PostChange> PostChanges { get; set; }
    public DbSet<DeletedPost> DeletedPosts { get; set; }
    public DbSet<Follows> Follows { get; set; }

    // Itinerary generator related
    public DbSet<Itinerary> Itineraries { get; set; }
    public DbSet<ItineraryDay> ItineraryDays { get; set; }
    public DbSet<ItineraryActivity> ItineraryActivities { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Itinerary
        modelBuilder.Entity<Itinerary>(entity =>
        {
            entity.HasKey(i => i.ItineraryId);
            entity.Property(i => i.Destination).IsRequired();
            entity.Property(i => i.CreatedAt).IsRequired();

            entity.HasMany(i => i.Days)
                .WithOne(d => d.Itinerary)
                .HasForeignKey(d => d.ItineraryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ItineraryDay
        modelBuilder.Entity<ItineraryDay>(entity =>
        {
            entity.HasKey(d => d.DayId);
            entity.Property(d => d.DayNumber).IsRequired();

            entity.HasMany(d => d.Activities)
                .WithOne(a => a.ItineraryDay)
                .HasForeignKey(a => a.ItineraryDayId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ItineraryActivity
        modelBuilder.Entity<ItineraryActivity>(entity =>
        {
            entity.HasKey(a => a.ActivityId);
            entity.Property(a => a.Title).IsRequired();
            entity.Property(a => a.Description).IsRequired();
            entity.Property(a => a.Location).IsRequired();
        });

        // follows
        modelBuilder.Entity<Follows>()
            .HasKey(f => new { f.UserIdFollowing, f.UserIdFollowed });

        modelBuilder.Entity<Follows>()
            .HasOne(f => f.FollowingUser)
            .WithMany()
            .HasForeignKey(f => f.UserIdFollowing)
            .HasConstraintName("FK_Follows_UserIDFollowing")
            .OnDelete(DeleteBehavior.Restrict); // handled at delete in code

        modelBuilder.Entity<Follows>()
            .HasOne(f => f.FollowedUser)
            .WithMany()
            .HasForeignKey(f => f.UserIdFollowed)
            .HasConstraintName("FK_Follows_UserIDFollowed")
            .OnDelete(DeleteBehavior.Restrict); // handled at delete in code


        modelBuilder.Entity<PostChange>()
           .HasKey(pc => pc.ChangeId);

        modelBuilder.Entity<DeletedPost>()
           .HasKey(dp => dp.DeletionId);

        modelBuilder.Entity<PostChange>()
           .HasOne(pc => pc.Post)
           .WithMany()
           .HasForeignKey(pc => pc.PostId)
           .OnDelete(DeleteBehavior.Cascade); 

        // Composite keys for Likes and Saves
        modelBuilder.Entity<Likes>()
            .HasKey(l => new { l.UserId, l.PostId });

        modelBuilder.Entity<Saves>()
            .HasKey(s => new { s.UserId, s.PostId });

        modelBuilder.Entity<CommentLike>()
            .HasKey(c => new { c.UserId, c.CommentId });

        // Foreign keys for CommentLikes
        modelBuilder.Entity<CommentLike>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .HasConstraintName("FK_CommentLikes_UserID")
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CommentLike>()
            .HasOne(c => c.Comment)
            .WithMany()
            .HasForeignKey(c => c.CommentId)
            .HasConstraintName("FK_CommentLikes_CommentID")
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign keys for Likes
        modelBuilder.Entity<Likes>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .HasConstraintName("FK_Likes_UserID")
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Likes>()
            .HasOne(l => l.Post)
            .WithMany()
            .HasForeignKey(l => l.PostId)
            .HasConstraintName("FK_Likes_PostID")
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign keys for Saves
        modelBuilder.Entity<Saves>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .HasConstraintName("FK_Saves_UserID")
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Saves>()
            .HasOne(s => s.Post)
            .WithMany()
            .HasForeignKey(s => s.PostId)
            .HasConstraintName("FK_Saves_PostID")
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key for Posts
        modelBuilder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .HasConstraintName("FK_Posts_UserID")
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key for PostMedia
        modelBuilder.Entity<PostMedia>()
            .HasKey(pm => pm.MediaId); // Explicitly set MediaID as the primary key
        modelBuilder.Entity<PostMedia>()
            .HasOne(pm => pm.Post)
            .WithMany(p => p.Media)
            .HasForeignKey(pm => pm.PostId)
            .HasConstraintName("FK_PostMedia_PostID")
            .OnDelete(DeleteBehavior.Cascade);

        // Define Comment entity
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.CommentId); // Primary Key

            entity.Property(c => c.Body)
                .IsRequired(); // Body is required

            // Relationship: Comment -> Post (Many-to-One)
            entity.HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade); // Delete comments when post is deleted

            // Relationship: Comment -> User (Many-to-One)
            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Don't delete comments when user is deleted

            // Self-Referential Relationship: Comment -> Comment (Replies)
            entity.HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict); // Delete replies when parent comment is deleted

            entity.HasOne(c => c.MentionedUser)
                .WithMany()  // A mentioned user doesn't necessarily need a collection of comments mentioning them
                .HasForeignKey(c => c.MentionedUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Define Accommodation entity
        modelBuilder.Entity<Accommodation>(entity =>
        {
            entity.HasKey(a => a.AccommodationId); // Primary key

            // Relationship: Accommodation -> Post (Many-to-One)
            entity.HasOne(a => a.Post)
                .WithMany(p => p.Accommodations)
                .HasForeignKey(a => a.PostId)
                .OnDelete(DeleteBehavior.Cascade); // Delete accommodation when post is deleted
        });

        // Define TripStep entity
        modelBuilder.Entity<TripStep>(entity =>
        {
            entity.HasKey(ts => ts.TripStepId); // Primary key

            // Relationship: TripStep -> Post (Many-to-One)
            entity.HasOne(ts => ts.Post)
                .WithMany(p => p.TripSteps)
                .HasForeignKey(ts => ts.PostId)
                .OnDelete(DeleteBehavior.Cascade); // Delete trip step when post is deleted
        });

        // Define TripStepMedia entity
        modelBuilder.Entity<TripStepMedia>(entity =>
        {
            entity.HasKey(tsm => tsm.MediaId); // Primary key

            // Relationship: TripStepMedia -> TripStep (Many-to-One)
            entity.HasOne(tsm => tsm.TripStep)
                .WithMany(ts => ts.Media)
                .HasForeignKey(tsm => tsm.TripStepId)
                .OnDelete(DeleteBehavior.Cascade); // Delete media when trip step is deleted
        });
    }

    public override int SaveChanges()
    {
        TrackPostChanges();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TrackPostChanges();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void TrackPostChanges()
    {
        var changes = new List<PostChange>();
        var deletions = new List<DeletedPost>();
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<Post>())
        {
            if (entry.State == EntityState.Added)
            {
                changes.Add(new PostChange
                {
                    ChangeId = Guid.NewGuid().ToString(),
                    PostId = entry.Entity.PostId,
                    ChangeType = "INSERT",
                    Caption = entry.Entity.Caption,
                    Body = entry.Entity.Body,
                    ChangeTime = utcNow,
                    Processed = false
                });
            }
            else if (entry.State == EntityState.Modified)
            {
                var existingUpdate = PostChanges
                    .FirstOrDefault(pc => pc.PostId == entry.Entity.PostId && pc.ChangeType == "UPDATE");

                var existingInsert = PostChanges
                    .FirstOrDefault(pc => pc.PostId == entry.Entity.PostId && pc.ChangeType == "INSERT");

                // if update exists for that postid then update that
                if (existingUpdate != null)
                {
                    existingUpdate.Caption = entry.Entity.Caption;
                    existingUpdate.Body = entry.Entity.Body;
                    existingUpdate.ChangeTime = utcNow; 
                    existingUpdate.Processed = false; 
                }

                // if insert exists for that postid then change ChangeType to UPDATE and update the rest
                if (existingInsert != null)
                {
                    existingInsert.ChangeType = "UPDATE";
                    existingInsert.Caption = entry.Entity.Caption;
                    existingInsert.Body = entry.Entity.Body;
                    existingInsert.ChangeTime = utcNow;
                    existingInsert.Processed = false; 
                }

                // if there is no insert/update for that post id then just add a new update log
                if (existingInsert == null && existingUpdate == null)
                {
                    PostChanges.Add(new PostChange
                    {
                        ChangeId = Guid.NewGuid().ToString(),
                        PostId = entry.Entity.PostId,
                        ChangeType = "UPDATE",
                        Caption = entry.Entity.Caption,
                        Body = entry.Entity.Body,
                        ChangeTime = utcNow,
                        Processed = false
                    });
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                deletions.Add(new DeletedPost
                {
                    DeletionId = Guid.NewGuid().ToString(),
                    PostId = entry.Entity.PostId,
                    DeleteTime = utcNow,
                    Processed = false
                });
            }
        }

        if (changes.Any())
        {
            PostChanges.AddRange(changes);
        }

        if (deletions.Any())
        {
            DeletedPosts.AddRange(deletions);
        }
    }
}
