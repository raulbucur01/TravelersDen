﻿namespace BackendAPI.DTOs.Posts
{
    public class UpdateItineraryPostDTO
    {
        public string Caption { get; set; } // The post's caption
        public string Body { get; set; }    // The post's body content
        public string Location { get; set; } // The location of the post
        public string Tags { get; set; }    // Comma-separated tags for the post
        public List<FileDataDTO> Files { get; set; }  // Array of file objects
        public List<TripStepDTO> TripSteps { get; set; } // Steps in the trip
        public List<AccommodationDTO> Accommodations { get; set; } // Accommodations
    }
}
