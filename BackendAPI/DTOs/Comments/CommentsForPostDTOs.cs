namespace BackendAPI.DTOs.Comments
{
    public class CommentUserDTO
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string ImageUrl { get; set; }
        public string Name { get; set; }
    }

    public class CommentReplyDTO
    {
        public string CommentId { get; set; }
        public string PostId { get; set; }
        public string? ParentCommentId { get; set; }
        public string? Mention { get; set; }
        public string? MentionedUserId { get; set; }
        public string Body { get; set; }
        public string CreatedAt { get; set; }
        public int LikesCount { get; set; }
        public CommentUserDTO User { get; set; }
    }

    public class CommentDTO
    {
        public string CommentId { get; set; }
        public string PostId { get; set; }
        public string Body { get; set; }
        public string CreatedAt { get; set; }
        public int LikesCount { get; set; }
        public CommentUserDTO User { get; set; }
        public List<CommentReplyDTO> Replies { get; set; } = new List<CommentReplyDTO>();
    }
}
