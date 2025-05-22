using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.DTOs.FastApiRelated;
using BackendAPI.Models.ItineraryGenerator;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/itinerary-generator")]
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
                    CreatedAt = itinerary.CreatedAt.ToLocalTime(),
                    Days = itinerary.Days.Select(d => new ItineraryDayDTO
                    {
                        DayId = d.DayId,
                        Day = d.Day,
                        Activities = d.Activities
                            .OrderBy(a => a.Position)
                            .Select(a => new ItineraryActivityDTO
                            {
                                ActivityId = a.ActivityId,
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
                    .OrderByDescending(i => i.CreatedAt)
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
                    CreatedAt = i.CreatedAt.ToLocalTime(),
                    Days = i.Days.Select(d => new ItineraryDayDTO
                    {
                        DayId = d.DayId,
                        Day = d.Day,
                        Activities = d.Activities.Select(a => new ItineraryActivityDTO
                        {
                            ActivityId = a.ActivityId,
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

        [HttpPut("generated-itineraries")]
        public async Task<IActionResult> SaveGeneratedItineraryChanges([FromBody] GeneratedItineraryDTO itineraryDto)
        {
            try
            {
                var itinerary = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .FirstOrDefaultAsync(i => i.ItineraryId == itineraryDto.ItineraryId);

                if (itinerary == null)
                {
                    return NotFound("Itinerary not found.");
                }

                // Update basic info
                itinerary.Destination = itineraryDto.Destination;
                itinerary.UserId = itineraryDto.UserId;
                itinerary.CreatedAt = DateTime.UtcNow;

                // Remove existing children
                _context.ItineraryActivities.RemoveRange(itinerary.Days.SelectMany(d => d.Activities));
                _context.ItineraryDays.RemoveRange(itinerary.Days);

                // Rebuild days and activities
                itinerary.Days = itineraryDto.Days.Select(dayDto => new ItineraryDay
                {
                    Day = dayDto.Day,
                    Activities = dayDto.Activities.Select((activityDto, index) => new ItineraryActivity
                    {
                        Title = activityDto.Title,
                        Description = activityDto.Description,
                        Location = activityDto.Location,
                        Position = index
                    }).ToList()
                }).ToList();

                await _context.SaveChangesAsync();

                return Ok(new { itineraryDto.ItineraryId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpDelete("generated-itineraries/{itineraryId}")]
        public async Task<IActionResult> DeleteGeneratedItinerary(string itineraryId)
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
                        Activities = d.Activities.Select((a, index) => new ItineraryActivity
                        {
                            Title = a.Title,
                            Description = a.Description,
                            Location = a.Location,
                            Position = index
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

        [HttpPost("regenerate-day-activities")]
        public async Task<IActionResult> RegenerateDayActivities([FromBody] RegenerateDayActivitiesRequestDTO request)
        {
            try
            {
                // find the full itinerary by its id
                var itinerary = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .FirstOrDefaultAsync(i => i.ItineraryId == request.ItineraryId);

                if (itinerary == null)
                {
                    return NotFound("Itinerary not found.");
                }

                // construct the excluded activities list by making a string array containing the titles
                // of all other activities in the itinerary except the ones from the day we want to regen
                var excludedActivityTitles = itinerary.Days
                    .Where(d => d.DayId != request.DayId)
                    .SelectMany(d => d.Activities)
                    .Select(a => a.Title)
                    .ToList();

                var regeneratedActivities = await _fastApiService.RegenerateDayActivitiesAsync(itinerary.Destination, excludedActivityTitles);

                return Ok(regeneratedActivities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
