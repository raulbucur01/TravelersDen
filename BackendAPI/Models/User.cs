using System.ComponentModel.DataAnnotations;

namespace TravelAppBackendAPI.Models
{
    public class User
    {
        [Key]
        public string UserId { get; set; } // Use the Appwrite user ID
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public string? Interests { get; set; }
        public string ImageUrl { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }

        public ICollection<Comment> Comments { get; set; } = new List<Comment>(); // Navigation to comments
    }
}
