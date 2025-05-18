namespace BackendAPI.DTOs.FastApiRelated
{
    public class GeneratedItineraryDTO
    {
        public string ItineraryId { get; set; }
        public string UserId { get; set; }
        public string Destination { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ItineraryDayDTO> Days { get; set; }
    }

    public class ItineraryDayDTO
    {
        public string DayId { get; set; }
        public int Day { get; set; }
        public List<ItineraryActivityDTO> Activities { get; set; }
    }

    public class ItineraryActivityDTO
    {
        public string ActivityId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public string? Position { get; set; } // Position of the activity in the day
    }
}
