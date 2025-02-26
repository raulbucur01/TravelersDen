namespace TravelAppBackendAPI.Models
{
    public class Accommodation
    {
        public string AccommodationId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; }  // Foreign Key
        public string Name { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? PricePerNight { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? Link { get; set; }

        public Post Post { get; set; }  // Navigation property to Post
    }
}
