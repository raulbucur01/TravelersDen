using Microsoft.EntityFrameworkCore;
using TravelAppBackendAPI.Models;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
    }
}
