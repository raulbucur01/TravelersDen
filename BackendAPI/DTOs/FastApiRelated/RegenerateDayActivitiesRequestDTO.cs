namespace BackendAPI.DTOs.FastApiRelated
{
    public class RegenerateDayActivitiesRequestDTO
    {
        public string ItineraryId { get; set; }
        public string DayId { get; set; }
    }
}
