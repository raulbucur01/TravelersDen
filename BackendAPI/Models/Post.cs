using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Models
{
    [Index(nameof(CreatedAt), IsDescending = new[] { true })]
    public class Post
    {
        public string PostId { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string Caption { get; set; }
        public string Body { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
        public DateTime CreatedAt { get; set; } // Timestamp for post creation
        public int LikesCount { get; set; } // Keeps track of likes
        public bool IsItinerary { get; set; }

        public User User { get; set; } // Navigation property
        public ICollection<PostMedia> Media { get; set; } = new List<PostMedia>(); // Navigation property
        public ICollection<Comment> Comments { get; set; } = new List<Comment>(); // Navigation to comments
        public ICollection<Accommodation> Accommodations { get; set; } = new List<Accommodation>();
        public ICollection<TripStep> TripSteps { get; set; } = new List<TripStep>();
    }

    public class PostCsvModel
    {
        public string Caption { get; set; }
        public string Body { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
    }

}
