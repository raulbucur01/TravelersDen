namespace BackendAPI.DTOs.FastApi
{
    public class SimilarPostsResponseDTO
    {
        public string PostId { get; set; }
        public List<string> SimilarPostIds { get; set; }
    }
}
