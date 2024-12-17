namespace TravelAppBackendAPI.Models
{
    public class TripStepMedia
    {
        public string MediaId { get; set; } = Guid.NewGuid().ToString();
        public string TripStepId { get; set; }  // Foreign Key
        public string AppwriteFileUrl { get; set; }
        public string MediaType { get; set; }  // Example: "image", "video", etc.

        public TripStep TripStep { get; set; }  // Navigation property to TripStep
    }

}
