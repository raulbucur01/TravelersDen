namespace BackendAPI.DTOs.FastApi
{
    public class RegenerateDayActivitiesRequestDTO
    {
        public string ItineraryId { get; set; }
        public string DayId { get; set; }
    }
}
