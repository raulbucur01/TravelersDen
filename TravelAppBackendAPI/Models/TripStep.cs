namespace TravelAppBackendAPI.Models
{
    public class TripStep
    {
        public string TripStepId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; }  // Foreign Key
        public int StepNumber { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? Zoom { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }

        public Post Post { get; set; }  // Navigation property to Post
        public ICollection<TripStepMedia> Media { get; set; } = new List<TripStepMedia>(); // Navigation property
    }

}
