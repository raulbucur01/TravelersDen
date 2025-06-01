using Microsoft.AspNetCore.Mvc;
using BackendAPI.DTOs.Posts;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authorization;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostsController : Controller
    {
        private readonly PostService _postService;

        public PostsController(PostService postService)
        {
            _postService = postService;
        }

        [HttpGet("{id}/similar-posts")]
        public async Task<IActionResult> GetSimilarPosts(string id)
        {
            try
            {
                var similarPosts = await _postService.GetSimilarPostsAsync(id);

                return Ok(similarPosts);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("normal")]
        public async Task<IActionResult> CreateNormalPost(CreateNormalPostDTO postDto)
        {
            try
            {
                await _postService.CreateNormalPostAsync(postDto);

                return Ok("Post created");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("itinerary")]
        public async Task<IActionResult> CreateItineraryPost(CreateItineraryPostDTO postDto)
        {
            try
            {
                await _postService.CreateItineraryPostAsync(postDto);

                return Ok("Post created");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("normal/{id}")]
        public async Task<IActionResult> UpdateNormalPost(string id, UpdateNormalPostDTO postDto)
        {
            try
            {
                await _postService.UpdateNormalPostAsync(id, postDto);

                return StatusCode(201, new { PostId = id });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("itinerary/{id}")]
        public async Task<IActionResult> UpdateItineraryPost(string id, UpdateItineraryPostDTO postDto)
        {
            try
            {
                await _postService.UpdateItineraryPostAsync(id, postDto);

                return StatusCode(201, new { PostId = id });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(string id)
        {
            try
            {
                var result = await _postService.DeletePostAsync(id);

                return Ok(new { result.PostId, result.UserId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/related-itinerary-media-urls")]
        public async Task<IActionResult> GetRelatedItineraryMediaUrls(string id)
        {
            try
            {
                var mediaUrls = await _postService.GetRelatedItineraryMediaUrlsAsync(id);

                return Ok(mediaUrls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("{id}")]   
        public async Task<IActionResult> GetPostById(string id)
        {
            try
            {
                var post = await _postService.GetPostByIdAsync(id);

                return Ok(post);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("recent-posts")]
        public async Task<IActionResult> GetRecentPosts(int page = 1, int pageSize = 10)
        {
            try
            {
                var (recentPosts, hasMore) = await _postService.GetRecentPostsAsync(page, pageSize);

                return Ok(new { posts = recentPosts, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}/liked-by")]
        public async Task<IActionResult> GetPostLikes(string id)
        {
            try
            {
                var likes = await _postService.GetPostLikesAsync(id);

                return Ok(likes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/saved-by")]
        public async Task<IActionResult> GetPostSaves(string id)
        {
            try
            {
                var saves = await _postService.GetPostSavesAsync(id);

                return Ok(saves);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikePost(LikeRequestDTO createLikeDTO)
        {
            try
            {
                var postIdLiked = await _postService.LikePostAsync(createLikeDTO);

                return Ok(new { PostId = postIdLiked });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("unlike/{userId}/{postId}")]
        public async Task<IActionResult> UnlikePost(string userId, string postId)
        {
            try
            {
                var postIdUnliked = await _postService.UnlikePostAsync(userId, postId);

                return Ok(new { PostId = postIdUnliked });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SavePost(SaveRequestDTO createSaveDTO)
        {
            try
            {
                var savedPostId = await _postService.SavePostAsync(createSaveDTO);

                return Ok(new { PostId = savedPostId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("unsave/{userId}/{postId}")]
        public async Task<IActionResult> UnsavePost(string userId, string postId)
        {
            try
            {
                var unsavedPostId = await _postService.UnsavePostAsync(userId, postId);
                
                return Ok(new { PostId = unsavedPostId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/like-count")]
        public async Task<IActionResult> GetLikeCount(string id)
        {
            try
            {
                var likeCount = await _postService.GetLikeCountAsync(id);

                return Ok(new { LikeCount = likeCount });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}/itinerary-details")]
        public async Task<IActionResult> GetItineraryDetails(string id)
        {
            try
            {
                var itineraryDetails = await _postService.GetItineraryDetailsAsync(id);

                return Ok(itineraryDetails);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchPosts([FromQuery] string searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (posts, hasMore) = await _postService.SearchPostsAsync(searchTerm, page, pageSize);

                return Ok(new { posts, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // base posts for initializing the app
        [AllowAnonymous]
        [HttpPost("import")]
        public IActionResult ImportPosts()
        {
            try
            {
                _postService.ImportPostsFromCsv();

                return Ok("CSV imported successfully!");
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the inner exception details
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

    }
}
