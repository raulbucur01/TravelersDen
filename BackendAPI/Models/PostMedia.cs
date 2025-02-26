namespace BackendAPI.Models
{
    public class PostMedia
    {
        public string MediaId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; }
        public string AppwriteFileUrl { get; set; } // Appwrite File ID for media (either photo or video)
        public string MediaType { get; set; } // 'Photo' or 'Video'

        public Post Post { get; set; } // Navigation property
    }
}
