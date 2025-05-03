using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.DTOs.FastApi;
using BackendAPI.Models.ItineraryGenerator;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("itinerary-generator")]
    public class ItineraryGeneratorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FastApiService _fastApiService;

        public ItineraryGeneratorController(FastApiService fastApiService, AppDbContext context)
        {
            _fastApiService = fastApiService;
            _context = context;
        }

        [HttpPost("generate-itinerary")]
        public async Task<IActionResult> GenerateItinerary([FromBody] GenerateItineraryRequestDTO request)
        {
            try
            {
                Console.WriteLine($"Request: {request.UserId}, {request.Destination}, {request.Days}, {request.Preferences}");
                var generatedItinerary = await _fastApiService.GenerateItineraryAsync(
                    request.Destination,
                    request.Days,
                    request.Preferences
                );

                Console.WriteLine($"Generated Itinerary: {generatedItinerary}");

                if (generatedItinerary == null)
                {
                    return StatusCode(500, "Failed to generate itinerary.");
                }

                // Map to EF entity
                var itinerary = new Itinerary
                {
                    UserId = request.UserId, // map to the user ID from the request (the user that requested the itinerary)
                    Destination = generatedItinerary.Destination,
                    CreatedAt = DateTime.UtcNow,
                    Days = generatedItinerary.Days.Select(d => new ItineraryDay
                    {
                        DayNumber = d.Day,
                        Activities = d.Activities.Select(a => new ItineraryActivity
                        {
                            Title = a.Title,
                            Description = a.Description,
                            Location = a.Location
                        }).ToList()
                    }).ToList()
                };

                _context.Itineraries.Add(itinerary);
                await _context.SaveChangesAsync();

                return Ok(new { itinerary.ItineraryId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
