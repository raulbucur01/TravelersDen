namespace BackendAPI.Models.ItineraryGenerator
{
    public class Itinerary
    {
        public string ItineraryId { get; set; } = Guid.NewGuid().ToString();
        public string Destination { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<ItineraryDay> Days { get; set; }
    }
}
