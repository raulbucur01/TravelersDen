using Microsoft.AspNetCore.Mvc;
using TravelAppBackendAPI.Models;
using TravelAppBackendAPI; // Assuming this is where your DbContext is
using Microsoft.EntityFrameworkCore;
using TravelAppBackendAPI.DTOs;

namespace TravelAppBackendAPI.Controllers
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
                        Gender = u.Gender ?? "",
                        Age = u.Age ?? 0,
                        Interests = u.Interests ?? "",
                        ImageUrl = u.ImageUrl,
                        City = u.City ?? "",
                        Country = u.Country ?? "",
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
    }
}
