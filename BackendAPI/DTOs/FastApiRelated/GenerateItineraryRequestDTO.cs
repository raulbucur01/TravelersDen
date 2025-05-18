namespace BackendAPI.DTOs.FastApiRelated
{
    public class GenerateItineraryRequestDTO
    {
        public string Destination { get; set; }
        public int Days { get; set; }
        public List<string> Preferences { get; set; }
        public string UserId { get; set; }
    }
}
