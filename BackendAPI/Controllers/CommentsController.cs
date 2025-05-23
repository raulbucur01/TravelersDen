using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Models;
using BackendAPI.DTOs.Comments;
using BackendAPI.Services;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/comments")]
    public class CommentsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly CommentService _commentService;

        public CommentsController(AppDbContext context, CommentService commentService)
        {
            _context = context;
            _commentService = commentService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment(CreateCommentDTO commentDto)
        {
            try
            {
                var newCommentPostId = await _commentService.CreateCommentAsync(commentDto);

                return StatusCode(201, new { newCommentPostId });
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
                var comments = await _commentService.GetCommentsForPostAsync(postId);

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
                var deletedCommentPostId = await _commentService.DeleteCommentAsync(commentId);

                return StatusCode(201, new { deletedCommentPostId });
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

        [HttpPut("{commentId}")]
        public async Task<IActionResult> EditComment(string commentId, EditCommentDTO editCommentDto)
        {
            try
            {
                var updatedCommentPostId = await _commentService.EditCommentAsync(commentId, editCommentDto);

                return StatusCode(201, new { updatedCommentPostId });
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

        [HttpGet("{id}/liked-by")]
        public async Task<IActionResult> GetCommentLikes(string id)
        {
            try
            {
                var likes = await _commentService.GetCommentLikesAsync(id);

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
                await _commentService.LikeCommentAsync(createLikeDTO);

                return StatusCode(201, new { createLikeDTO.CommentId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
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
                await _commentService.UnlikeCommentAsync(userId, commentId);

                return StatusCode(201, new { commentId });
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

        [HttpGet("{id}/like-count")]
        public async Task<IActionResult> GetLikeCount(string id)
        {
            try
            {
                var likesCount = await _commentService.GetCommentLikesAsync(id);

                return Ok(new { LikeCount = likesCount });
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
    }
}
