namespace TravelAppBackendAPI.DTOs
{
    public class EditCommentDTO
    {
        public string? Mention { get; set; }
        public string? MentionedUserId { get; set; }
        public string Body { get; set; } // Comment text
    }
}
