﻿namespace BackendAPI.DTOs.Auth
{
    public class RegisterRequestDTO
    {
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ImageUrl { get; set; }
    }
}
