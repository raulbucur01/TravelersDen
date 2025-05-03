namespace BackendAPI.Models.ItineraryGenerator
{
    public class Itinerary
    {
        public string ItineraryId { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string Destination { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public List<ItineraryDay> Days { get; set; }
        public User User { get; set; }
    }
}
