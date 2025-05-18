namespace BackendAPI.DTOs.FastApiRelated.FastApiService
{
    public class SimilarPostsFastApiResponseDTO
    {
        public string PostId { get; set; }
        public List<string> SimilarPostIds { get; set; }
    }
}
