﻿namespace BackendAPI.Models
{
    public class Save
    {
        public string UserId { get; set; }
        public string PostId { get; set; }

        public User User { get; set; } // Navigation property
        public Post Post { get; set; } // Navigation property
    }
}
