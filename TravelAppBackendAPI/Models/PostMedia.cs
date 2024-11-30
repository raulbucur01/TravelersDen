namespace TravelAppBackendAPI.Models
{
    public class PostMedia
    {
        public string MediaID { get; set; } = Guid.NewGuid().ToString();
        public string PostID { get; set; }
        public string AppwriteFileURL { get; set; } // Appwrite File ID for media (either photo or video)
        public string MediaType { get; set; } // 'Photo' or 'Video'

        public Post Post { get; set; } // Navigation property
    }
}
