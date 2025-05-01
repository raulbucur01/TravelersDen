namespace BackendAPI.DTOs.Users
{
    public class CreateUserDTO
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
    }
}
