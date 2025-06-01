namespace BackendAPI.Models
{
    public class Comment
    {
        public string CommentId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; } // Foreign Key to the Posts table
        public string? UserId { get; set; } // Foreign Key to the Users table
        public string? ParentCommentId { get; set; } // Nullable for top-level comments
        public string? Mention { get; set; } // the @mention
        public string? MentionedUserId { get; set; } // the id of the mentioned user
        public string Body { get; set; } // Comment text
        public DateTime CreatedAt { get; set; } // Auto-set to current time
        public int LikeCount { get; set; } = 0; // Default is 0

        // Navigation Properties
        public Comment ParentComment { get; set; } // Self-referential relationship
        public ICollection<Comment> Replies { get; set; } = new List<Comment>(); // Replies to this comment
        public Post Post { get; set; } // Navigation to the associated Post
        public User User { get; set; } // Navigation to the User who made the comment
        public User MentionedUser { get; set; } // Navigation to the Mentioned User (new relationship)
    }
}
