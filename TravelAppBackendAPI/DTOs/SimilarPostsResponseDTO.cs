namespace TravelAppBackendAPI.DTOs
{
    public class SimilarPostsResponseDTO
    {
        public string PostId { get; set; }
        public List<string> SimilarPosts { get; set; }
    }
}
