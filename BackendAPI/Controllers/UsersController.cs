using Microsoft.AspNetCore.Mvc;
using BackendAPI.Models;
using BackendAPI; // Assuming this is where your DbContext is
using Microsoft.EntityFrameworkCore;
using BackendAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Hosting;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : Controller
    {
        private readonly AppDbContext _context; // Your DbContext

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/User
        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserDTO userDto)
        {
            try
            {
                var user = new User
                {
                    UserId = userDto.UserId,
                    Name = userDto.Name,
                    Username = userDto.Username,
                    Email = userDto.Email,
                    ImageUrl = userDto.ImageUrl
                    // Other fields remain null/default
                };

                // Add user to the database
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Return a success response
                return StatusCode(200, "User Created");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                // Handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, UpdateUserDTO updateUserDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null) {
                    return NotFound(new { Message = "User not found." });
                }

                user.Name = updateUserDto.Name;
                user.Username = updateUserDto.Username;
                user.Bio = updateUserDto.Bio;
                user.ImageUrl = updateUserDto.ImageUrl;

                await _context.SaveChangesAsync();

                return Ok(new { UserId = id, updateUserDto.ImageUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                // Handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                // Search for the user with the given id
                var user = await _context.Users
                    .Where(u => u.UserId == id)
                    .Select(u => new
                    {
                        UserId = u.UserId,
                        Name = u.Name,
                        Username = u.Username,
                        Email = u.Email,
                        Bio = u.Bio,
                        Gender = u.Gender ?? "",
                        Age = u.Age ?? 0,
                        Interests = u.Interests ?? "",
                        ImageUrl = u.ImageUrl,
                        City = u.City ?? "",
                        Country = u.Country ?? "",
                        FollowerCount = u.FollowerCount,
                        FollowingCount = u.FollowingCount,
                        PostCount = u.PostCount,
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Return the user's data
                return Ok(user);
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            // remove all related follows
            var follows = _context.Follows.Where(f => f.UserIdFollowing == id || f.UserIdFollowed == id);
            _context.Follows.RemoveRange(follows);

            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { UserId = id });
        }

        [HttpGet("{id}/followers")]
        public async Task<IActionResult> GetFollowers(string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var totalFollowers = await _context.Follows.Where(f => f.UserIdFollowed == id).CountAsync();

                var followers = await _context.Follows
                    .Where(f => f.UserIdFollowed == id)
                    .OrderByDescending(f => f.FollowedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(f => new
                    {
                        f.FollowingUser.UserId,
                        f.FollowingUser.Name,
                        f.FollowingUser.Username,
                        f.FollowingUser.ImageUrl,
                    })
                    .ToListAsync();

                bool hasMore = (page * pageSize) < totalFollowers;

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
                var totalFollowing = await _context.Follows.Where(f => f.UserIdFollowing == id).CountAsync();

                var following = await _context.Follows
                    .Where(f => f.UserIdFollowing == id)
                    .OrderByDescending(f => f.FollowedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(f => new
                    {
                        f.FollowedUser.UserId,
                        f.FollowedUser.Name,
                        f.FollowedUser.Username,
                        f.FollowedUser.ImageUrl,
                    })
                    .ToListAsync();

                bool hasMore = (page * pageSize) < totalFollowing;

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
                var totalPosts = await _context.Posts.Where(p => p.UserId == id).CountAsync();

                var posts = await _context.Posts
                    .Where(p => p.UserId == id)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new
                    {
                        p.PostId,
                        FirstMediaUrl = p.Media
                        .Select(m => m.AppwriteFileUrl)
                        .FirstOrDefault(),
                        p.IsItinerary,
                    }).ToListAsync();

                bool hasMore = (page * pageSize) < totalPosts;

                return Ok(new { posts, hasMore });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("follow")]
        public async Task<IActionResult> Follow(FollowRequestDTO createFollowDTO)
        {
            try
            {
                var newFollow = new Follows
                {
                    UserIdFollowing = createFollowDTO.UserIdFollowing,
                    UserIdFollowed = createFollowDTO.UserIdFollowed,
                    FollowedAt = DateTime.UtcNow,
                };

                _context.Follows.Add(newFollow);

                var users = await _context.Users
                .Where(u => u.UserId == createFollowDTO.UserIdFollowing || u.UserId == createFollowDTO.UserIdFollowed)
                .ToListAsync();

                var userFollowing = users.FirstOrDefault(u => u.UserId == createFollowDTO.UserIdFollowing);
                var userFollowed = users.FirstOrDefault(u => u.UserId == createFollowDTO.UserIdFollowed);

                if (userFollowing == null || userFollowed == null)
                {
                    return NotFound("One or both users not found.");
                }

                userFollowed.FollowerCount++;
                userFollowing.FollowingCount++;

                await _context.SaveChangesAsync();

                return Ok(new {createFollowDTO.UserIdFollowing, createFollowDTO.UserIdFollowed});
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
                // Find the follow record to remove
                var followRecord = await _context.Follows
                    .FirstOrDefaultAsync(f => f.UserIdFollowing == userIdUnfollowing && f.UserIdFollowed == userIdFollowed);

                if (followRecord == null)
                {
                    return NotFound("Follow not found.");
                }

                // Remove the follow from the database
                _context.Follows.Remove(followRecord);

                var users = await _context.Users
                .Where(u => u.UserId == userIdUnfollowing || u.UserId == userIdFollowed)
                .ToListAsync();

                var userUnfollowing = users.FirstOrDefault(u => u.UserId == userIdUnfollowing);
                var userFollowed = users.FirstOrDefault(u => u.UserId == userIdFollowed);

                if (userUnfollowing == null || userFollowed == null)
                {
                    return NotFound("One or both users not found.");
                }

                userFollowed.FollowerCount--;
                userUnfollowing.FollowingCount--;

                await _context.SaveChangesAsync();

                return Ok(new {userIdUnfollowing, userIdFollowed});
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
                bool isFollowing = await _context.Follows
                    .AnyAsync(f => f.UserIdFollowing == id1 && f.UserIdFollowed == id2);

                return Ok(new { isFollowing });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
