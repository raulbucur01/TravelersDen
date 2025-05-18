namespace BackendAPI.DTOs.FastApiRelated
{
    public class SimilarUserDTO
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public string? Bio { get; set; }

        public string? FollowedBy { get; set; }  // Nullable
        public int MutualCount { get; set; }
    }

}
