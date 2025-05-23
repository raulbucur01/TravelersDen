using Microsoft.AspNetCore.Mvc;
using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;
using BackendAPI.DTOs.Users;
using BackendAPI.Services;
using BackendAPI.DTOs.FastApiRelated;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : Controller
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, UpdateUserDTO updateUserDto)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, updateUserDto);

                return Ok(new { UserId = id, updateUserDto.ImageUrl });
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);

                return Ok(user);
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
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var deletedUserId = await _userService.DeleteUserAsync(id);

                return Ok(new { UserId = deletedUserId });
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

        [HttpGet("{id}/followers")]
        public async Task<IActionResult> GetFollowers(string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (followers, hasMore) = await _userService.GetFollowersAsync(id, page, pageSize);
                return Ok(new { followers, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/following")]
        public async Task<IActionResult> GetFollowing(string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (following, hasMore) = await _userService.GetFollowingAsync(id, page, pageSize);
                return Ok(new { following, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/posts")]
        public async Task<IActionResult> GetUserPosts(string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (posts, hasMore) = await _userService.GetUserPostsAsync(id, page, pageSize);
                return Ok(new { posts, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("follow")]
        public async Task<IActionResult> Follow([FromBody] FollowRequestDTO createFollowDTO)
        {
            try
            {
                var (followerId, followedId) = await _userService.CreateFollowAsync(createFollowDTO);
                return Ok(new { UserIdFollowing = followerId, UserIdFollowed = followedId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpDelete("unfollow/{userIdUnfollowing}/{userIdFollowed}")]
        public async Task<IActionResult> Unfollow(string userIdUnfollowing, string userIdFollowed)
        {
            try
            {
                var (unfollowerId, unfollowedId) = await _userService.RemoveFollowAsync(userIdUnfollowing, userIdFollowed);
                return Ok(new { userIdUnfollowing = unfollowerId, userIdFollowed = unfollowedId });
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


        [HttpGet("{id1}/is-following/{id2}")]
        public async Task<IActionResult> IsFollowing(string id1, string id2)
        {
            try
            {
                bool isFollowing = await _userService.IsUserFollowingAsync(id1, id2);
                return Ok(new { isFollowing });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("{id}/similar-users")]
        public async Task<IActionResult> GetSimilarUsers(string id)
        {
            try
            {
                var similarUsers = await _userService.GetSimilarUsersAsync(id);
                return Ok(similarUsers);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
