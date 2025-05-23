using BackendAPI.DTOs.Auth;
using BackendAPI.Models;
using Microsoft.AspNetCore.Identity.Data;

namespace BackendAPI.Services
{
    public class AuthService
    {
        private readonly TokenService _tokenService;
        private readonly UserService _userService;

        public AuthService(TokenService tokenService, UserService userService)
        {
            _tokenService = tokenService;
            _userService = userService;
        }

        public async Task<string> Authenticate(string email, string password)
        {
            var user = await _userService.ValidateCredentialsAndGetUser(email, password);

            return _tokenService.GenerateToken(user);
        }

        public async Task<string> Register(RegisterRequestDTO registerRequest)
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

            var registeredUser = await _userService.RegisterUser(user);

            return _tokenService.GenerateToken(registeredUser);
        }
    }
}
