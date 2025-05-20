namespace BackendAPI.DTOs.Auth
{
    public class CurrentUserDTO
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public string? Bio { get; set; } // Nullable
    }
}
