using BackendAPI.DTOs.Auth;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : Controller
    {
        private readonly AuthService _authService;
        private readonly JwtSettings _jwtSettings;

        public AuthController(AuthService authService, IOptions<JwtSettings> jwtSettings)
        {
            _authService = authService;
            _jwtSettings = jwtSettings.Value;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO loginRequest)
        {
            try
            {
                var token = await _authService.Authenticate(loginRequest.Email, loginRequest.Password);

                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                    Path = "/",
                });

                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO registerRequest)
        {
            try
            {
                // map the RegisterRequestDTO to User model
                var user = new User
                {
                    Name = registerRequest.Name,
                    Email = registerRequest.Email,
                    Username = registerRequest.Username,
                    Password = registerRequest.Password,
                    ImageUrl = registerRequest.ImageUrl,
                };

                var token = await _authService.Register(user);

                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                    Path = "/",
                });

                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            try
            {
                Response.Cookies.Delete("jwt", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Path = "/",
                });

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            try
            {
                // check if the user is authenticated currently
                // if not, return an unauthorized response to show that its not possible to get the current user if not logged in
                if (User.Identity == null || !User.Identity.IsAuthenticated)
                {
                    return Unauthorized("User is not authenticated.");
                }

                // extract user-related claims from the JWT token
                // these claims were added when the token was generated
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                //var nameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
                //var usernameClaim = User.FindFirst("username")?.Value;
                //var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;
                //var imageUrlClaim = User.FindFirst("imageUrl")?.Value;


                // check if the claims are not null or empty
                if (
                    //string.IsNullOrEmpty(emailClaim)
                    string.IsNullOrEmpty(idClaim)
                    //|| string.IsNullOrEmpty(nameClaim)
                    //|| string.IsNullOrEmpty(usernameClaim)
                    //|| string.IsNullOrEmpty(imageUrlClaim)
                    )
                {
                    return Unauthorized("Invalid or missing claims!");
                }

                return Ok(new CurrentUserDTO
                {
                    UserId = idClaim,
                    //Name = nameClaim,
                    //Username = usernameClaim,
                    //Email = emailClaim,
                    //ImageUrl = imageUrlClaim
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
