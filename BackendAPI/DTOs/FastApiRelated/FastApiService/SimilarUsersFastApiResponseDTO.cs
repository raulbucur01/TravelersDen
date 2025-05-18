namespace BackendAPI.DTOs.FastApiRelated.FastApiService
{
    public class SimilarUsersFastApiResponseDTO
    {
        public string UserId { get; set; }
        public List<string> SimilarUserIds { get; set; }
    }
}
