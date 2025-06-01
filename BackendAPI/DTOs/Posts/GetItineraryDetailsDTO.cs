namespace BackendAPI.DTOs.Posts
{
    public class GetItineraryDetailsDTO
    {
        public List<GetItineraryDetailsTripStepDTO> TripSteps { get; set; }
        public List<GetItineraryDetailsAccommodationDTO> Accommodations { get; set; }
    }

    public class GetItineraryDetailsTripStepDTO
    {
        public string TripStepId { get; set; }
        public int StepNumber { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? Zoom { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        public List<MediaDTO> MediaUrls { get; set; }
    }

    public class GetItineraryDetailsAccommodationDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? PricePerNight { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? Link { get; set; }
    }
}
