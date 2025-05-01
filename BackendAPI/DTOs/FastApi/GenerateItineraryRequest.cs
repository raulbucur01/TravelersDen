namespace BackendAPI.DTOs.FastApi
{
    public class GenerateItineraryRequest
    {
        public string Destination { get; set; }
        public int Days { get; set; }
        public List<string> Preferences { get; set; }
    }
}
