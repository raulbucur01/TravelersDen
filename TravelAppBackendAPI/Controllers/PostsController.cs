using Microsoft.AspNetCore.Mvc;
using TravelAppBackendAPI.DTOs;
using TravelAppBackendAPI.Models;

namespace TravelAppBackendAPI.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        private readonly AppDbContext _context; // Your DbContext

        public PostsController(AppDbContext context)
        {
            _context = context;
        }
        // POST: api/User
        [HttpPost("createPost")]
        public async Task<IActionResult> CreatePost(CreatePostDTO postDto)
        {
            try
            {
                var post = new Post
                {
                    UserID = postDto.UserID,
                    Caption = postDto.Caption,
                    Body = postDto.Body,
                    Location = postDto.Location,
                    Tags = postDto.Tags,
                    CreatedAt = DateTime.UtcNow,
                    LikesCount = 0,
                };

                // Add post to the database
                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                // Add media files to the post (photo/video URLs and types)
                foreach (var fileData in postDto.Files)
                {
                    var postMedia = new PostMedia
                    {
                        PostID = post.PostID,
                        AppwriteFileURL = fileData.Url,
                        MediaType = fileData.Type,  // Get the media type directly from the object
                    };

                    _context.PostMedia.Add(postMedia);
                }

                await _context.SaveChangesAsync();

                return StatusCode(200, "Post Created");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
