namespace TravelAppBackendAPI.Models
{
    public class Likes
    {
        public string UserID { get; set; }
        public string PostID { get; set; } 

        public User User { get; set; } // Navigation property
        public Post Post { get; set; } // Navigation property
    }
}
