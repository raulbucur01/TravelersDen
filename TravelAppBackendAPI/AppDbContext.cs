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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite keys for Likes and Saves
        modelBuilder.Entity<Likes>()
            .HasKey(l => new { l.UserId, l.PostId });

        modelBuilder.Entity<Saves>()
            .HasKey(s => new { s.UserId, s.PostId });

        // Foreign keys for Likes
        modelBuilder.Entity<Likes>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .HasConstraintName("FK_Likes_UserID")
            .OnDelete(DeleteBehavior.Cascade);

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
            .OnDelete(DeleteBehavior.Cascade);

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
    }
}
