namespace BackendAPI.DTOs.Posts
{
    public class PostDTO
    {
        public string PostId { get; set; }
        public string UserId { get; set; }
        public string Caption { get; set; }
        public string Body { get; set; }
        public List<MediaDTO> MediaUrls { get; set; }
        public string Location { get; set; }
        public string Tags { get; set; }
        public string CreatedAt { get; set; }
        public int LikesCount { get; set; }
        public bool IsItinerary { get; set; }
    }

    public class MediaDTO
    {
        public string Url { get; set; }
        public string Type { get; set; }
    }
}
