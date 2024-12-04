using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAppBackendAPI.DTOs;
using TravelAppBackendAPI.Models;

namespace TravelAppBackendAPI.Controllers
{
    [ApiController]
    [Route("comments")]
    public class CommentsController : Controller
    {
        private readonly AppDbContext _context; // Your DbContext

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment(CreateCommentDTO commentDto)
        {
            try
            {
                var comment = new Comment
                {
                    UserId = commentDto.UserId,
                    PostId = commentDto.PostId,
                    Body = commentDto.Body,
                    ParentCommentId = commentDto.ParentCommentId,  // Can be null for top-level comments
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                return StatusCode(201, "Comment Created");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{postId}")]
        public async Task<IActionResult> GetCommentsForPost(string postId)
        {
            try
            {
                var comments = await _context.Comments
                    .Where(c => c.PostId == postId && c.ParentCommentId == null)  // Get top-level comments
                    .OrderBy(c => c.CreatedAt)  // Order by creation time
                    .Select(c => new
                    {
                        c.CommentId,
                        c.UserId,
                        c.Body,
                        c.CreatedAt,
                        c.LikesCount,
                        Replies = _context.Comments
                            .Where(reply => reply.ParentCommentId == c.CommentId)  // Get replies to the current comment
                            .Select(reply => new
                            {
                                reply.CommentId,
                                reply.UserId,
                                reply.Body,
                                reply.CreatedAt,
                                reply.LikesCount
                            })
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(comments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(string commentId)
        {
            try
            {
                var comment = await _context.Comments
                    .Include(c => c.Replies) // Include replies for cascading delete
                    .FirstOrDefaultAsync(c => c.CommentId == commentId);

                if (comment == null)
                {
                    return NotFound("Comment not found.");
                }

                // Recursively delete replies first
                foreach (var reply in comment.Replies)
                {
                    _context.Comments.Remove(reply);
                }

                // Remove the comment itself
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                return Ok("Comment deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{commentId}")]
        public async Task<IActionResult> EditComment(string commentId, EditCommentDTO editCommentDto)
        {
            try
            {
                var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == commentId);

                if (comment == null)
                {
                    return NotFound("Comment not found.");
                }

                comment.Body = editCommentDto.Body;
                await _context.SaveChangesAsync();

                return Ok("Comment updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/liked-by")]
        public async Task<IActionResult> GetCommentLikes(string id)
        {
            try
            {
                var likes = await _context.CommentLikes
                    .Where(like => like.CommentId == id)
                    .Select(like => like.UserId)
                    .ToListAsync();

                return Ok(likes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikeComment(CommentLikeRequestDTO createLikeDTO)
        {
            try
            {
                var existingLike = await _context.CommentLikes
                    .FirstOrDefaultAsync(cl => cl.UserId == createLikeDTO.UserId && cl.CommentId == createLikeDTO.CommentId);

                if (existingLike != null)
                {
                    return BadRequest("User has already liked this comment.");
                }

                var newLike = new CommentLike
                {
                    UserId = createLikeDTO.UserId,
                    CommentId = createLikeDTO.CommentId,
                };

                _context.CommentLikes.Add(newLike);

                var comment = await _context.Comments.FindAsync(createLikeDTO.CommentId);
                if (comment == null)
                {
                    return NotFound("Comment not found.");
                }

                comment.LikesCount++; // Increment the LikesCount
                await _context.SaveChangesAsync();

                return Ok(newLike);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("unlike/{userId}/{commentId}")]
        public async Task<IActionResult> UnlikeComment(string userId, string commentId)
        {
            try
            {
                // Find the like record to remove
                var likeRecord = await _context.CommentLikes
                    .FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == userId);

                if (likeRecord == null)
                {
                    return NotFound("Like not found.");
                }

                // Remove the like from the database
                _context.CommentLikes.Remove(likeRecord);

                var comment = await _context.Comments.FindAsync(commentId);
                if (comment == null)
                {
                    return NotFound("Comment not found.");
                }

                comment.LikesCount--; // Decrement the LikesCount
                await _context.SaveChangesAsync();

                return Ok("Comment unliked successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
