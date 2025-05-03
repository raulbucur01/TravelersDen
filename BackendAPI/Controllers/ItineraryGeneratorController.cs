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

        [HttpGet("generated-itineraries/by-id/{itineraryId}")]
        public async Task<IActionResult> GetGeneratedItineraryById(string itineraryId)
        {
            try
            {
                var itinerary = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .FirstOrDefaultAsync(i => i.ItineraryId == itineraryId);

                if (itinerary == null)
                {
                    return NotFound("Itinerary not found.");
                }

                // map to DTO
                var itineraryDto = new GeneratedItineraryDTO
                {
                    ItineraryId = itinerary.ItineraryId,
                    UserId = itinerary.UserId,
                    Destination = itinerary.Destination,
                    CreatedAt = itinerary.CreatedAt,
                    Days = itinerary.Days.Select(d => new ItineraryDayDTO
                    {
                        Day = d.Day,
                        Activities = d.Activities.Select(a => new ItineraryActivityDTO
                        {
                            Title = a.Title,
                            Description = a.Description,
                            Location = a.Location
                        }).ToList()
                    }).ToList()
                };

                return Ok(itineraryDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("generated-itineraries/by-user/{userId}")]
        public async Task<IActionResult> GetGeneratedItinerariesForUser(string userId)
        {
            try
            {
                var itineraries = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .Where(i => i.UserId == userId)
                    .ToListAsync();

                if (itineraries == null || !itineraries.Any())
                {
                    return NotFound("No itineraries found for this user.");
                }

                // map to DTOs
                var itineraryDtos = itineraries.Select(i => new GeneratedItineraryDTO
                {
                    ItineraryId = i.ItineraryId,
                    UserId = i.UserId,
                    Destination = i.Destination,
                    CreatedAt = i.CreatedAt,
                    Days = i.Days.Select(d => new ItineraryDayDTO
                    {
                        Day = d.Day,
                        Activities = d.Activities.Select(a => new ItineraryActivityDTO
                        {
                            Title = a.Title,
                            Description = a.Description,
                            Location = a.Location
                        }).ToList()
                    }).ToList()
                }).ToList();

                return Ok(itineraryDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("generated-itineraries/{itineraryId}")]
        public async Task<IActionResult> DeleteItinerary(string itineraryId)
        {
            try
            {
                var itinerary = await _context.Itineraries.FindAsync(itineraryId);

                if (itinerary == null)
                {
                    return NotFound("Itinerary not found.");
                }

                _context.Itineraries.Remove(itinerary);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("generate-itinerary")]
        public async Task<IActionResult> GenerateItinerary([FromBody] GenerateItineraryRequestDTO request)
        {
            try
            {
                var generatedItinerary = await _fastApiService.GenerateItineraryAsync(
                    request.Destination,
                    request.Days,
                    request.Preferences
                );

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
                        Day = d.Day,
                        Activities = d.Activities.Select(a => new ItineraryActivity
                        {
                            Title = a.Title,
                            Description = a.Description,
                            Location = a.Location
                        }).ToList()
                    }).ToList()
                };

                // Save to database
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
