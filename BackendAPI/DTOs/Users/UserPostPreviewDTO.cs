namespace BackendAPI.DTOs.Users
{
    public class UserPostPreviewDTO
    {
        public string PostId { get; set; } = string.Empty;
        public string? FirstMediaUrl { get; set; }
        public bool IsItinerary { get; set; }
    }
}
