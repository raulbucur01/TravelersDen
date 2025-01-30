using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.Intrinsics.Arm;
using TravelAppBackendAPI.DTOs;
using TravelAppBackendAPI.Models;

namespace TravelAppBackendAPI.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        private readonly AppDbContext _context; // Your DbContext

        public PostsController(AppDbContext context)
        {
            _context = context;
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

                return StatusCode(201, new { id });
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
                    .Take(20) // Limit to the most recent 20 posts
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
                            StepNumber = ts.StepNumber,
                            Latitude = ts.Latitude,
                            Longitude = ts.Longitude,
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

    }
}
