namespace TravelAppBackendAPI.Models
{
    public class CommentLike
    {
        public string UserId { get; set; }
        public string CommentId { get; set; }

        // Navigation properties
        public User User { get; set; }
        public Comment Comment { get; set; }
    }
}
