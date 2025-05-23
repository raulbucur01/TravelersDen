using BackendAPI.DTOs.FastApiRelated;
using BackendAPI.DTOs.FastApiRelated.FastApiService;
using BackendAPI.Models.ItineraryGenerator;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
{
    public class ItineraryGeneratorService
    {
        private readonly FastApiService _fastApiService;
        private readonly AppDbContext _context;
        public ItineraryGeneratorService(FastApiService fastApiService, AppDbContext context)
        {
            _fastApiService = fastApiService;
            _context = context;
        }

        public async Task<GeneratedItineraryDTO> GetGeneratedItineraryByIdAsync(string itineraryId)
        {
            var itinerary = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .FirstOrDefaultAsync(i => i.ItineraryId == itineraryId);

            if (itinerary == null)
            {
                throw new KeyNotFoundException("Itinerary not found.");
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

            return itineraryDto;
        }

        public async Task<List<GeneratedItineraryDTO>> GetGeneratedItinerariesForUserAsync(string userId)
        {
            var itineraries = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .Where(i => i.UserId == userId)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();

            if (itineraries == null || !itineraries.Any())
            {
                throw new KeyNotFoundException("No itineraries found for this user.");
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

            return itineraryDtos;
        }

        public async Task<string> SaveGeneratedItineraryChangesAsync(GeneratedItineraryDTO itineraryDto)
        {
            var itinerary = await _context.Itineraries
                    .Include(i => i.Days)
                    .ThenInclude(d => d.Activities)
                    .FirstOrDefaultAsync(i => i.ItineraryId == itineraryDto.ItineraryId);

            if (itinerary == null)
            {
                throw new KeyNotFoundException("Itinerary not found.");
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

            return itineraryDto.ItineraryId;
        }

        public async Task DeleteGeneratedItineraryAsync(string itineraryId)
        {
            var itinerary = await _context.Itineraries.FindAsync(itineraryId);

            if (itinerary == null)
            {
                throw new KeyNotFoundException("Itinerary not found.");
            }

            _context.Itineraries.Remove(itinerary);
            await _context.SaveChangesAsync();
        }

        public async Task<string> GenerateItineraryAsync(GenerateItineraryRequestDTO request)
        {
            var generatedItinerary = await _fastApiService.GenerateItineraryAsync(
                    request.Destination,
                    request.Days,
                    request.Preferences
                );

            if (generatedItinerary == null)
            {
                throw new InvalidOperationException("Failed to generate itinerary.");
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

            return itinerary.ItineraryId;
        }

        public async Task<List<RawItineraryActivityFastApiDTO>> RegenerateDayActivitiesAsync(RegenerateDayActivitiesRequestDTO request)
        {
            // find the full itinerary by its id
            var itinerary = await _context.Itineraries
                .Include(i => i.Days)
                .ThenInclude(d => d.Activities)
                .FirstOrDefaultAsync(i => i.ItineraryId == request.ItineraryId);

            if (itinerary == null)
            {
                throw new KeyNotFoundException("Itinerary not found.");
            }

            // construct the excluded activities list by making a string array containing the titles
            // of all other activities in the itinerary except the ones from the day we want to regen
            var excludedActivityTitles = itinerary.Days
                .Where(d => d.DayId != request.DayId)
                .SelectMany(d => d.Activities)
                .Select(a => a.Title)
                .ToList();

            var regeneratedActivities = await _fastApiService.RegenerateDayActivitiesAsync(itinerary.Destination, excludedActivityTitles);

            return regeneratedActivities;
        }
    }
}
