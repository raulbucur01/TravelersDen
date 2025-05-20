using BackendAPI.Models;

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

        public async Task<string> Register(User user)
        {
            var registeredUser = await _userService.RegisterUser(user);

            return _tokenService.GenerateToken(registeredUser);
        }
    }
}
