namespace BackendAPI.Models.ItineraryGenerator
{
    public class ItineraryActivity
    {
        public string ActivityId { get; set; } = Guid.NewGuid().ToString();
        public string ItineraryDayId { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }

        public ItineraryDay ItineraryDay { get; set; }
    }
}
