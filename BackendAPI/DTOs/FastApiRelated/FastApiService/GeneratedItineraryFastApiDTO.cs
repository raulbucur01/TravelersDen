namespace BackendAPI.DTOs.FastApiRelated.FastApiService
{
    public class GeneratedItineraryFastApiDTO
    {
        public string Destination { get; set; }
        public List<DayDTO> Days { get; set; }
    }

    public class DayDTO
    {
        public int Day { get; set; }
        public List<ActivityDTO> Activities { get; set; }
    }

    public class ActivityDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
    }
}
