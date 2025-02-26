namespace BackendAPI.DTOs
{
    public class CreateItineraryPostDTO
    {
        public string UserId { get; set; }
        public string Caption { get; set; }
        public string Body { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
        public List<FileDataDTO> Files { get; set; } // Photo/video files
        public List<TripStepDTO> TripSteps { get; set; } // Steps in the trip
        public List<AccommodationDTO> Accommodations { get; set; } // Accommodations
    }

    public class TripStepDTO
    {
        public int StepNumber { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? Zoom { get; set; }
        public decimal? Price { get; set; }
        public string Description { get; set; }
        public List<FileDataDTO> Files { get; set; } // Media files for the step
    }

    public class AccommodationDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? PricePerNight { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? Link { get; set; }
    }

}
