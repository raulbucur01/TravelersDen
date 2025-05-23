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
        private readonly ItineraryGeneratorService _itineraryGeneratorService;

        public ItineraryGeneratorController(ItineraryGeneratorService itineraryGeneratorService)
        {
            _itineraryGeneratorService = itineraryGeneratorService;
        }

        [HttpGet("generated-itineraries/by-id/{itineraryId}")]
        public async Task<IActionResult> GetGeneratedItineraryById(string itineraryId)
        {
            try
            {
                var itineraryDto = await _itineraryGeneratorService.GetGeneratedItineraryByIdAsync(itineraryId);
                return Ok(itineraryDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("generated-itineraries/by-user/{userId}")]
        public async Task<IActionResult> GetGeneratedItinerariesForUser(string userId)
        {
            try
            {
                var itineraries = await _itineraryGeneratorService.GetGeneratedItinerariesForUserAsync(userId);
                return Ok(itineraries);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("generated-itineraries")]
        public async Task<IActionResult> SaveGeneratedItineraryChanges([FromBody] GeneratedItineraryDTO itineraryDto)
        {
            try
            {
                var itineraryId = await _itineraryGeneratorService.SaveGeneratedItineraryChangesAsync(itineraryDto);
                return Ok(new { ItineraryId = itineraryId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
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
                await _itineraryGeneratorService.DeleteGeneratedItineraryAsync(itineraryId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("generate-itinerary")]
        public async Task<IActionResult> GenerateItinerary([FromBody] GenerateItineraryRequestDTO request)
        {
            try
            {
                var itineraryId = await _itineraryGeneratorService.GenerateItineraryAsync(request);
                return Ok(new { ItineraryId = itineraryId });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("regenerate-day-activities")]
        public async Task<IActionResult> RegenerateDayActivities([FromBody] RegenerateDayActivitiesRequestDTO request)
        {
            try
            {
                var regenerated = await _itineraryGeneratorService.RegenerateDayActivitiesAsync(request);
                return Ok(regenerated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
