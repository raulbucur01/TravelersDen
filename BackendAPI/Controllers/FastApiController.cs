using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.DTOs.FastApi;
using BackendAPI.Models.ItineraryGenerator;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("fastApi")]
    public class FastApiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FastApiService _fastApiService;

        public FastApiController(FastApiService fastApiService, AppDbContext context)
        {
            _fastApiService = fastApiService;
            _context = context;
        }

        [HttpGet("{id}/similar-posts")]
        public async Task<IActionResult> GetSimilarPosts(string id)
        {
            try
            {
                var similarPostsResponse = await _fastApiService.GetSimilarPostsAsync(id);

                if (similarPostsResponse == null)
                {
                    return NotFound("No similar posts found.");
                }

                var similarPostIds = similarPostsResponse.SimilarPostIds;

                // If no similar posts found yet, then return randomly
                if (!similarPostIds.Any())
                {
                    int totalCount = await _context.Posts.CountAsync();
                    int skip = new Random().Next(0, Math.Max(1, totalCount - 5));  // Pick a random starting point

                    var randomPosts = await _context.Posts
                        .Where(p => p.PostId != id)
                        .OrderBy(p => p.PostId)
                        .Skip(skip)
                        .Take(5)
                        .Select(p => new
                        {
                            PostId = p.PostId,
                            UserId = p.UserId,
                            Caption = p.Caption,
                            Body = p.Body,
                            MediaUrls = p.Media.Select(m => new { url = m.AppwriteFileUrl, type = m.MediaType }).ToList(),
                            Location = p.Location,
                            Tags = p.Tags,
                            CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"),
                            LikesCount = p.LikesCount,
                            IsItinerary = p.IsItinerary,
                        })
                        .ToListAsync();

                    return Ok(randomPosts);
                }

                var similarPosts = await _context.Posts
                    .Where(p => similarPostIds.Contains(p.PostId))
                    .Select(p => new
                    {
                        PostId = p.PostId,
                        UserId = p.UserId,
                        Caption = p.Caption,
                        Body = p.Body,
                        MediaUrls = p.Media.Select(m => new { url = m.AppwriteFileUrl, type = m.MediaType }).ToList(),
                        Location = p.Location,
                        Tags = p.Tags,
                        CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"), // ISO 8601 format (you can adjust the format as needed)
                        LikesCount = p.LikesCount,
                        IsItinerary = p.IsItinerary,
                    })
                    .ToListAsync();

                return Ok(similarPosts);
            }
            catch (Exception ex)
            {
                // Log the error and return a generic error response
                return StatusCode(500, "Internal server error: " + ex.Message);
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
