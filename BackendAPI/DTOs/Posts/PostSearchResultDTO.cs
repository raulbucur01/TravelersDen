namespace BackendAPI.DTOs.Posts
{
    public class PostSearchResultDTO
    {
        public string PostId { get; set; }
        public string UserId { get; set; }
        public string Caption { get; set; }
        public int LikeCount { get; set; }
        public List<MediaDTO> MediaUrls { get; set; }
    }
}
