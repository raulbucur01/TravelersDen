namespace BackendAPI.Models.ItineraryGenerator
{
    public class ItineraryDay
    {
        public string DayId { get; set; } = Guid.NewGuid().ToString();
        public string ItineraryId { get; set; }
        public int DayNumber { get; set; }

        public Itinerary Itinerary { get; set; }
        public List<ItineraryActivity> Activities { get; set; }
    }
}
