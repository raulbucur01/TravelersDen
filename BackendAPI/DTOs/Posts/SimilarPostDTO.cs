namespace BackendAPI.DTOs.Posts
{
    public class SimilarPostDTO
    {
        public string PostId { get; set; }
        public string UserId { get; set; }
        public string Caption { get; set; }
        public string Body { get; set; }
        public List<SimilarPostMediaDTO> MediaUrls { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
        public string CreatedAt { get; set; } // ISO 8601 string
        public int LikeCount { get; set; }
        public bool IsItinerary { get; set; }
    }

    public class SimilarPostMediaDTO
    {
        public string Url { get; set; }
        public string Type { get; set; }
    }
}
