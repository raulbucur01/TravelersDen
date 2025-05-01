namespace BackendAPI.DTOs.Comments
{
    public class CreateCommentDTO
    {
        public string UserId { get; set; } // Foreign Key to the Users table
        public string PostId { get; set; } // Foreign Key to the Posts table
        public string? ParentCommentId { get; set; } // Nullable for top-level comments
        public string? Mention { get; set; }
        public string? MentionedUserId { get; set; }
        public string Body { get; set; } // Comment text
    }
}
