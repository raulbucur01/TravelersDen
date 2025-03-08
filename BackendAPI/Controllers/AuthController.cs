using Appwrite.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : Controller
    {
        // Setting the Cookie (From Backend to Browser)
        // When the backend sends a response with a Set-Cookie header,
        // the browser automatically stores the cookie.This happens in your SetCookie method
        // in the AuthController.
        // The Response.Cookies.Append method sets an HTTP response header like this:
        // Set-Cookie: AppwriteJWT=your_jwt_token; HttpOnly; Secure; SameSite=None; Expires=Wed, 12 Mar 2025 12:34:56 GMT
        // When the browser receives this header, it stores the cookie in its internal cookie storage,
        // associated with the domain of the response
        // When you set a cookie with Response.Cookies.Append("AppwriteJWT", token, cookieOptions);,
        // it is only stored in the browser that made the request.
        [AllowAnonymous]
        [HttpPost("set-cookie")]
        public IActionResult SetCookie([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) || request.Expiration <= 0)
                return BadRequest("Invalid token data.");

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.FromUnixTimeMilliseconds(request.Expiration)
            };

            Response.Cookies.Append("AppwriteJWT", request.Token, cookieOptions);
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("AppwriteJWT");
            return Ok();
        }
    }

    public class TokenRequest
    {
        public string Token { get; set; }
        public long Expiration { get; set; }
    }
}
