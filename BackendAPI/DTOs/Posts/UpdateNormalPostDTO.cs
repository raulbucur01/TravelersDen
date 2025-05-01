namespace BackendAPI.DTOs.Posts
{
    public class UpdateNormalPostDTO
    {
        public string Caption { get; set; } // The post's caption
        public string Body { get; set; }    // The post's body content
        public string Location { get; set; } // The location of the post
        public string Tags { get; set; }    // Comma-separated tags for the post
        public List<FileDataDTO> NewFiles { get; set; }  // Array of file objects
        public List<string> DeletedFiles { get; set; }
    }
}
