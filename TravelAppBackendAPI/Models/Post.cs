namespace TravelAppBackendAPI.Models
{
    public class Post
    {
        public string PostID { get; set; } = Guid.NewGuid().ToString();
        public string UserID { get; set; }
        public string Caption { get; set; }
        public string Body { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
        public DateTime CreatedAt { get; set; } // Timestamp for post creation
        public int LikesCount { get; set; } // Keeps track of likes

        public User User { get; set; } // Navigation property
        public ICollection<PostMedia> Media { get; set; } = new List<PostMedia>(); // Navigation property
    }
}
