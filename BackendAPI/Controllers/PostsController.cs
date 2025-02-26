using Azure.Core;
using CsvHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
using System.Runtime.Intrinsics.Arm;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        private readonly AppDbContext _context; // Your DbContext
        private readonly FastApiService _fastApiService;

        public PostsController(AppDbContext context, FastApiService fastApiService)
        {
            _context = context;
            _fastApiService = fastApiService;
        }

        [HttpPost("normal")]
        public async Task<IActionResult> CreateNormalPost(CreateNormalPostDTO postDto)
        {
            try
            {
                var post = new Post
                {
                    UserId = postDto.UserId,
                    Caption = postDto.Caption,
                    Body = postDto.Body,
                    Location = postDto.Location,
                    Tags = postDto.Tags,
                    CreatedAt = DateTime.UtcNow,
                    LikesCount = 0,
                };

                post.IsItinerary = false;

                // Add post to the database
                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                // Add media files to the post (photo/video URLs and types)
                foreach (var fileData in postDto.Files)
                {
                    var postMedia = new PostMedia
                    {
                        PostId = post.PostId,
                        AppwriteFileUrl = fileData.Url,
                        MediaType = fileData.Type,  // Get the media type directly from the object
                    };

                    _context.PostMedia.Add(postMedia);
                }

                await _context.SaveChangesAsync();

                return StatusCode(200, "Post Created");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("itinerary")]
        public async Task<IActionResult> CreateItineraryPost(CreateItineraryPostDTO postDto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Create post
                    var post = new Post
                    {
                        UserId = postDto.UserId,
                        Caption = postDto.Caption,
                        Body = postDto.Body,
                        Location = postDto.Location,
                        Tags = postDto.Tags,
                        CreatedAt = DateTime.UtcNow,
                        LikesCount = 0,
                        IsItinerary = true
                    };

                    _context.Posts.Add(post);
                    await _context.SaveChangesAsync();

                    // Collect related entities
                    var postMediaList = postDto.Files.Select(file => new PostMedia
                    {
                        PostId = post.PostId,
                        AppwriteFileUrl = file.Url,
                        MediaType = file.Type
                    }).ToList();

                    var tripStepList = new List<TripStep>();
                    var tripStepMediaList = new List<TripStepMedia>();

                    foreach (var step in postDto.TripSteps)
                    {
                        var tripStep = new TripStep
                        {
                            PostId = post.PostId,
                            StepNumber = step.StepNumber,
                            Latitude = step.Latitude,
                            Longitude = step.Longitude,
                            Zoom = step.Zoom,
                            Price = step.Price,
                            Description = step.Description
                        };
                        tripStepList.Add(tripStep);

                        if (step.Files != null)
                        {
                            tripStepMediaList.AddRange(step.Files.Select(file => new TripStepMedia
                            {
                                TripStepId = tripStep.TripStepId, // Updated later during save
                                AppwriteFileUrl = file.Url,
                                MediaType = file.Type
                            }));
                        }
                    }

                    var accommodationList = postDto.Accommodations.Select(acc => new Accommodation
                    {
                        PostId = post.PostId,
                        Name = acc.Name,
                        Description = acc.Description,
                        Latitude = acc.Latitude,
                        Longitude = acc.Longitude,
                        StartDate = acc.StartDate,
                        EndDate = acc.EndDate,
                        PricePerNight = acc.PricePerNight,
                        TotalPrice = acc.TotalPrice,
                        Link = acc.Link
                    }).ToList();

                    // Add all entities in batch
                    _context.PostMedia.AddRange(postMediaList);
                    _context.TripSteps.AddRange(tripStepList);
                    _context.TripStepMedia.AddRange(tripStepMediaList);
                    _context.Accommodations.AddRange(accommodationList);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return StatusCode(201, new { post.PostId });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpPut("normal/{id}")]
        public async Task<IActionResult> UpdateNormalPost(string id, UpdateNormalPostDTO postDto)
        {
            try
            {
                var post = await _context.Posts.Include(p => p.Media)
                    .FirstOrDefaultAsync(p => p.PostId == id);

                if (post == null)
                {
                    return NotFound(new { Message = "Post not found." });
                }

                // Update basic post details
                post.Caption = postDto.Caption;
                post.Body = postDto.Body;
                post.Location = postDto.Location;
                post.Tags = postDto.Tags;

                // delete the media the user deleted if any
                var urlsToDelete = postDto.DeletedFiles;
                if (urlsToDelete.Any()) // Avoid executing if no files are marked for deletion
                {
                    await _context.PostMedia
                        .Where(m => urlsToDelete.Contains(m.AppwriteFileUrl))
                        .ExecuteDeleteAsync();
                }

                // add the newly added media if any
                var mediaToAdd = postDto.NewFiles;
                if (mediaToAdd.Any())
                {
                    _context.PostMedia.AddRange(mediaToAdd.Select(media => new PostMedia
                    {
                        PostId = id,
                        AppwriteFileUrl = media.Url,
                        MediaType = media.Type
                    }));
                }

                await _context.SaveChangesAsync();

                return StatusCode(201, new { PostId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("itinerary/{id}")]
        public async Task<IActionResult> UpdateItineraryPost(string id, UpdateItineraryPostDTO postDto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var post = await _context.Posts
                        .Include(p => p.Media)
                        .Include(p => p.Accommodations)
                        .Include(p => p.TripSteps)
                        .FirstOrDefaultAsync(p => p.PostId == id);

                    if (post == null)
                    {
                        return NotFound(new { Message = "Post not found." });
                    }

                    // Update basic post details
                    post.Caption = postDto.Caption;
                    post.Body = postDto.Body;
                    post.Location = postDto.Location;
                    post.Tags = postDto.Tags;

                    // Remove old TripSteps and Accommodations
                    _context.TripSteps.RemoveRange(post.TripSteps);
                    _context.Accommodations.RemoveRange(post.Accommodations);
                    _context.PostMedia.RemoveRange(post.Media);

                    // Collect related entities
                    var postMediaList = postDto.Files.Select(file => new PostMedia
                    {
                        PostId = post.PostId,
                        AppwriteFileUrl = file.Url,
                        MediaType = file.Type
                    }).ToList();

                    var tripStepList = new List<TripStep>();
                    var tripStepMediaList = new List<TripStepMedia>();

                    foreach (var step in postDto.TripSteps)
                    {
                        var tripStep = new TripStep
                        {
                            PostId = post.PostId,
                            StepNumber = step.StepNumber,
                            Latitude = step.Latitude,
                            Longitude = step.Longitude,
                            Zoom = step.Zoom,
                            Price = step.Price,
                            Description = step.Description
                        };
                        tripStepList.Add(tripStep);

                        if (step.Files != null)
                        {
                            tripStepMediaList.AddRange(step.Files.Select(file => new TripStepMedia
                            {
                                TripStepId = tripStep.TripStepId, // Updated later during save
                                AppwriteFileUrl = file.Url,
                                MediaType = file.Type
                            }));
                        }
                    }

                    var accommodationList = postDto.Accommodations.Select(acc => new Accommodation
                    {
                        PostId = post.PostId,
                        Name = acc.Name,
                        Description = acc.Description,
                        Latitude = acc.Latitude,
                        Longitude = acc.Longitude,
                        StartDate = acc.StartDate,
                        EndDate = acc.EndDate,
                        PricePerNight = acc.PricePerNight,
                        TotalPrice = acc.TotalPrice,
                        Link = acc.Link
                    }).ToList();

                    // Add all entities in batch
                    _context.PostMedia.AddRange(postMediaList);
                    _context.TripSteps.AddRange(tripStepList);
                    _context.TripStepMedia.AddRange(tripStepMediaList);
                    _context.Accommodations.AddRange(accommodationList);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return StatusCode(201, new { PostId = id });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(string id)
        {
            try {
                var post = await _context.Posts.FindAsync(id);

                if (post == null)
                {
                    return NotFound(new { Message = "Post not found." });
                }

                _context.Posts.Remove(post);
                await _context.SaveChangesAsync();

                return Ok(new { PostId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/related-itinerary-media-urls")]
        public async Task<IActionResult> GetRelatedItineraryMediaUrls(string id) {
            try
            {
                // Query the TripSteps where PostId matches the provided id
                var tripSteps = await _context.TripSteps
                    .Where(ts => ts.PostId == id)
                    .Include(ts => ts.Media)
                    .ToListAsync(); ;

                var mediaUrls = tripSteps
                    .SelectMany(ts => ts.Media)
                    .Select(media => media.AppwriteFileUrl)
                    .ToArray();

                return Ok(mediaUrls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("{id}")]   
        public async Task<IActionResult> GetPostById(string id)
        {
            try
            {
                var post = await _context.Posts
                    .Where(p => p.PostId == id)
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
                        IsItinerary = p.IsItinerary
                    })
                    .FirstOrDefaultAsync();

                if (post == null)
                {
                    return NotFound(new { Message = "Post not found." });
                }

                return Ok(post);
            }
            catch (Exception ex)
            {
                // Log the error and return a generic error response
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("recent-posts")]
        public async Task<IActionResult> GetRecentPosts()
        {
            try
            {
                // Fetch the most recent 20 posts, ordered by CreatedAt in descending order, without including User or Media
                var recentPosts = await _context.Posts
                    .OrderByDescending(p => p.CreatedAt) // Order by CreatedAt in descending order
                    .Take(10) // Limit to the most recent 20 posts
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

                // Return the list of posts as a response
                return Ok(recentPosts);
            }
            catch (Exception ex)
            {
                // Log the error and return a generic error response
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}/liked-by")]
        public async Task<IActionResult> GetPostLikes(string id)
        {
            try
            {
                var likes = await _context.Likes
                    .Where(like => like.PostId == id)
                    .Select(like => like.UserId)
                    .ToListAsync();

                return Ok(likes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/saved-by")]
        public async Task<IActionResult> GetPostSaves(string id)
        {
            try
            {
                var saves = await _context.Saves
                    .Where(save => save.PostId == id)
                    .Select(save => save.UserId)
                    .ToListAsync();

                return Ok(saves);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikePost(LikeRequestDTO createLikeDTO)
        {
            try
            {
                var newLike = new Likes 
                {
                    UserId = createLikeDTO.UserId,
                    PostId = createLikeDTO.PostId,
                };

                _context.Likes.Add(newLike);

                var post = await _context.Posts.FindAsync(createLikeDTO.PostId);
                if (post == null)
                {
                    return NotFound("Post not found.");
                }

                post.LikesCount++; // Increment the LikesCount
                await _context.SaveChangesAsync();

                return Ok(newLike);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("unlike/{userId}/{postId}")]
        public async Task<IActionResult> UnlikePost(string userId, string postId)
        {
            try
            {
                // Find the like record to remove
                var likeRecord = await _context.Likes
                    .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

                if (likeRecord == null)
                {
                    return NotFound("Like not found.");
                }

                // Remove the like from the database
                _context.Likes.Remove(likeRecord);

                var post = await _context.Posts.FindAsync(postId);
                if (post == null)
                {
                    return NotFound("Post not found.");
                }

                post.LikesCount--; 
                await _context.SaveChangesAsync();

                return Ok("Post unliked successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("save")]
        public async Task<IActionResult> SavePost(SaveRequestDTO createSaveDTO)
        {
            try
            {
                var newSave = new Saves
                {
                    UserId = createSaveDTO.UserId,
                    PostId = createSaveDTO.PostId,
                };

                _context.Saves.Add(newSave);
                await _context.SaveChangesAsync();

                return Ok(newSave);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("unsave/{userId}/{postId}")]
        public async Task<IActionResult> UnsavePost(string userId, string postId)
        {
            try
            {
                // Find the save record to remove
                var saveRecord = await _context.Saves
                    .FirstOrDefaultAsync(s => s.PostId == postId && s.UserId == userId);

                if (saveRecord == null)
                {
                    return NotFound("Save record not found.");
                }

                // Remove the save from the database
                _context.Saves.Remove(saveRecord);
                await _context.SaveChangesAsync();

                return Ok("Post unsaved successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/like-count")]
        public async Task<IActionResult> GetLikeCount(string id)
        {
            try
            {
                var post = await _context.Posts
                    .Where(p => p.PostId == id)
                    .FirstOrDefaultAsync();

                if (post == null)
                {
                    return NotFound(new { Message = "Post not found." });
                }

                return Ok(new { LikeCount = post.LikesCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}/itinerary-details")]
        public async Task<IActionResult> GetItineraryDetails(string id)
        {
            try
            {
                // Fetch the itinerary steps and accommodations for the given post ID
                var itineraryDetails = new
                {
                    TripSteps = await _context.TripSteps
                        .Where(ts => ts.PostId == id)
                        .OrderBy(ts => ts.StepNumber) // Ensure steps are ordered
                        .Select(ts => new
                        {
                            TripStepId = ts.TripStepId,
                            StepNumber = ts.StepNumber,
                            Latitude = ts.Latitude,
                            Longitude = ts.Longitude,
                            Zoom = ts.Zoom,
                            Price = ts.Price,
                            Description = ts.Description,
                            MediaUrls = ts.Media.Select(m => new
                            {
                                Url = m.AppwriteFileUrl,
                                Type = m.MediaType
                            }).ToList()
                        })
                        .ToListAsync(),
                    Accommodations = await _context.Accommodations
                        .Where(a => a.PostId == id)
                        .Select(a => new
                        {
                            Name = a.Name,
                            Description = a.Description,
                            Latitude = a.Latitude,
                            Longitude = a.Longitude,
                            StartDate = a.StartDate,
                            EndDate = a.EndDate,
                            PricePerNight = a.PricePerNight,
                            TotalPrice = a.TotalPrice,
                            Link = a.Link
                        })
                        .ToListAsync()
                };

                // Check if any data is available
                if (itineraryDetails.TripSteps.Count == 0 && itineraryDetails.Accommodations.Count == 0)
                {
                    return NotFound(new { Message = "No itinerary details found for this post." });
                }

                // Return the itinerary details
                return Ok(itineraryDetails);
            }
            catch (Exception ex)
            {
                // Log the error and return a generic error response
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
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

        [HttpPost("import")]
        public IActionResult ImportPosts()
        {
            try
            {
                _context.Database.SetCommandTimeout(180); // Timeout in seconds

                string filePath = Path.Combine(Directory.GetCurrentDirectory(), "posts.csv");

                if (!System.IO.File.Exists(filePath))
                    return NotFound("CSV file not found!");

                using (var reader = new StreamReader(filePath))
                using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                {
                    var posts = csv.GetRecords<PostCsvModel>().ToList();

                    // Convert CSV data to Post entities
                    var newPosts = posts.Select(p =>
                    {
                        string generatedPostId = Guid.NewGuid().ToString();

                        return new Post
                        {
                            PostId = generatedPostId,
                            UserId = "674b191b001951acb483",
                            Caption = p.Caption.Length > 2200 ? p.Caption.Substring(0, 2200) : p.Caption,
                            Body = p.Body.Length > 2200 ? p.Body.Substring(0, 2200) : p.Body,
                            Location = p.Location,
                            Tags = p.Tags,
                            CreatedAt = DateTime.UtcNow,
                            LikesCount = 0,
                            IsItinerary = false,
                            Media = new List<PostMedia>
                        {
                            new PostMedia
                            {
                                MediaId = Guid.NewGuid().ToString(),
                                PostId = generatedPostId,
                                AppwriteFileUrl = "https://cloud.appwrite.io/v1/storage/buckets/679e6e110026b5d8c68c/files/67a217ca003d22c9b4b8/preview?width=2000&height=2000&gravity=top&quality=100&project=6740c57e0035d48d554d",
                                MediaType = "Photo"
                            }
                        }
                        };
                    }).ToList();

                    // Add to DB
                    _context.Posts.AddRange(newPosts);
                    _context.SaveChanges();
                }

                return Ok("✅ CSV imported successfully!");
            }
            catch (Exception ex)
            {
                // Log the inner exception details
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

    }
}
