namespace TravelAppBackendAPI.DTOs
{
    public class CreatePostDTO
    {
        public string UserID { get; set; }  // The ID of the user creating the post
        public string Caption { get; set; } // The post's caption
        public string Body { get; set; }    // The post's body content
        public string Location { get; set; } // The location of the post
        public string Tags { get; set; }    // Comma-separated tags for the post
        public List<FileDataDTO> Files { get; set; }  // Array of file objects
    }

    public class FileDataDTO
    {
        public string Url { get; set; }
        public string Type { get; set; }
    }
}
