using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class User
    {
        [Key]
        public string UserId { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Bio {  get; set; }
        public string ImageUrl { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostCount { get; set; }

        public ICollection<Comment> Comments { get; set; } = new List<Comment>(); // Navigation to comments
    }
}
