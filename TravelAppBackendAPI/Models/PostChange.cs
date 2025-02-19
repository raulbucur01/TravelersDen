namespace TravelAppBackendAPI.Models
{
    public class PostChange
    {
        public string ChangeId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; }
        public string ChangeType { get; set; }
        public DateTime ChangeTime { get; set; } = DateTime.UtcNow;
        public bool Processed { get; set; } = false; // ✅ Tracks which changes are handled

        public Post Post { get; set; } // Navigation Property
    }
}
