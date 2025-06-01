using BackendAPI.DTOs.Posts;
using BackendAPI.Models;
using CsvHelper;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace BackendAPI.Services
{
    public class PostService
    {
        private readonly FastApiService _fastApiService;
        private readonly AppDbContext _context;

        public PostService(AppDbContext context, FastApiService fastApiService)
        {
            _context = context;
            _fastApiService = fastApiService;
        }

        public async Task<List<SimilarPostDTO>> GetSimilarPostsAsync(string postId)
        {
            var similarPostsResponse = await _fastApiService.GetSimilarPostsAsync(postId);

            if (similarPostsResponse == null)
            {
                throw new KeyNotFoundException("Couldn't get similar posts from FastApi.");
            }

            var similarPostIds = similarPostsResponse.SimilarPostIds;

            // If no similar posts found yet, then return randomly
            if (!similarPostIds.Any())
            {
                int totalCount = await _context.Posts.CountAsync();

                var randomPosts = await _context.Posts
                    .Where(p => p.PostId != postId)
                    .OrderBy(p => p.PostId)
                    .Take(10)
                    .Select(p => new SimilarPostDTO
                    {
                        PostId = p.PostId,
                        UserId = p.UserId,
                        Caption = p.Caption,
                        Body = p.Body,
                        MediaUrls = p.Media.Select(m => new SimilarPostMediaDTO { Url = m.AppwriteFileUrl, Type = m.MediaType }).ToList(),
                        Location = p.Location,
                        Tags = p.Tags,
                        CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"),
                        LikeCount = p.LikeCount,
                        IsItinerary = p.IsItinerary,
                    })
                    .ToListAsync();

                return randomPosts;
            }

            var similarPosts = await _context.Posts
                .Where(p => similarPostIds.Contains(p.PostId))
                .Select(p => new SimilarPostDTO
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Caption = p.Caption,
                    Body = p.Body,
                    MediaUrls = p.Media.Select(m => new SimilarPostMediaDTO { Url = m.AppwriteFileUrl, Type = m.MediaType }).ToList(),
                    Location = p.Location,
                    Tags = p.Tags,
                    CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"), // ISO 8601 format (you can adjust the format as needed)
                    LikeCount = p.LikeCount,
                    IsItinerary = p.IsItinerary,
                })
                .ToListAsync();

            return similarPosts;
        }

        public async Task CreateNormalPostAsync(CreateNormalPostDTO postDto)
        {
            var userCreating = await _context.Users.FindAsync(postDto.UserId);

            if (userCreating == null)
            {
                throw new KeyNotFoundException("User creating not found. Can't create post!");
            }

            var post = new Post
            {
                UserId = postDto.UserId,
                Caption = postDto.Caption,
                Body = postDto.Body,
                Location = postDto.Location,
                Tags = postDto.Tags,
                CreatedAt = DateTime.UtcNow,
                LikeCount = 0,
                IsItinerary = false,
            };

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

            // increment user post count
            userCreating.PostCount++;

            await _context.SaveChangesAsync();
        }

        public async Task CreateItineraryPostAsync(CreateItineraryPostDTO postDto)
        {
            var userCreating = await _context.Users.FindAsync(postDto.UserId);

            if (userCreating == null)
            {
                throw new KeyNotFoundException("User creating not found. Can't create post!");
            }

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
                        LikeCount = 0,
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

                    // increment user post count
                    userCreating.PostCount++;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }

        public async Task UpdateNormalPostAsync(string postId, UpdateNormalPostDTO postDto)
        {
            var post = await _context.Posts.Include(p => p.Media)
                    .FirstOrDefaultAsync(p => p.PostId == postId);

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
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
                    PostId = postId,
                    AppwriteFileUrl = media.Url,
                    MediaType = media.Type
                }));
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateItineraryPostAsync(string postId, UpdateItineraryPostDTO postDto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var post = await _context.Posts
                        .Include(p => p.Media)
                        .Include(p => p.Accommodations)
                        .Include(p => p.TripSteps)
                        .FirstOrDefaultAsync(p => p.PostId == postId);

                    if (post == null)
                    {
                        throw new KeyNotFoundException("Post not found.");
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
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }

        public async Task<(string PostId, string UserId)> DeletePostAsync(string postId)
        {
            var post = await _context.Posts.FindAsync(postId);

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            // decrement user post count
            var userDeleting = await _context.Users.FindAsync(post.UserId);

            if (userDeleting == null)
            {
                throw new KeyNotFoundException("User deleting not found.");
            }

            userDeleting.PostCount--;

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return (PostId: postId, UserId: userDeleting.UserId);
        }

        public async Task<string[]> GetRelatedItineraryMediaUrlsAsync(string postId)
        {
            // Query the TripSteps where PostId matches the provided id
            var tripSteps = await _context.TripSteps
                .Where(ts => ts.PostId == postId)
                .Include(ts => ts.Media)
                .ToListAsync();

            var mediaUrls = tripSteps
                .SelectMany(ts => ts.Media)
                .Select(media => media.AppwriteFileUrl)
                .ToArray();

            return mediaUrls;
        }

        public async Task<PostDTO> GetPostByIdAsync(string postId)
        {
            var post = await _context.Posts
                    .Where(p => p.PostId == postId)
                    .Select(p => new PostDTO
                    {
                        PostId = p.PostId,
                        UserId = p.UserId,
                        Caption = p.Caption,
                        Body = p.Body,
                        MediaUrls = p.Media.Select(m => new MediaDTO { Url = m.AppwriteFileUrl, Type = m.MediaType }).ToList(),
                        Location = p.Location,
                        Tags = p.Tags,
                        CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"), // ISO 8601 format (you can adjust the format as needed)
                        LikeCount = p.LikeCount,
                        IsItinerary = p.IsItinerary
                    })
                    .FirstOrDefaultAsync();

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            return post;
        }

        public async Task<(List<PostDTO> Posts, bool HasMore)> GetRecentPostsAsync(int page = 1, int pageSize = 10)
        {
            var totalPosts = await _context.Posts.CountAsync();

            var recentPosts = await _context.Posts
                .OrderByDescending(p => p.CreatedAt) // Order by CreatedAt in descending order
                .Skip((page - 1) * pageSize) // Skip posts from previous pages
                .Take(pageSize) // Take only the requested number of posts
                .Select(p => new PostDTO
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Caption = p.Caption,
                    Body = p.Body,
                    MediaUrls = p.Media.Select(m => new MediaDTO { Url = m.AppwriteFileUrl, Type = m.MediaType }).ToList(),
                    Location = p.Location,
                    Tags = p.Tags,
                    CreatedAt = p.CreatedAt.ToLocalTime().ToString("o"), // ISO 8601 format (you can adjust the format as needed)
                    LikeCount = p.LikeCount,
                    IsItinerary = p.IsItinerary,
                })
                .ToListAsync();

            bool hasMore = (page * pageSize) < totalPosts; // Check if there are more posts to fetch

            return (recentPosts, hasMore);
        }

        public async Task<List<string>> GetPostLikesAsync(string postId)
        {
            var likes = await _context.Likes
                    .Where(like => like.PostId == postId)
                    .Select(like => like.UserId)
                    .ToListAsync();

            return likes;
        }

        public async Task<List<string>> GetPostSavesAsync(string postId)
        {
            var saves = await _context.Saves
                    .Where(save => save.PostId == postId)
                    .Select(save => save.UserId)
                    .ToListAsync();

            return saves;
        }

        public async Task<string> LikePostAsync(LikeRequestDTO createLikeDTO)
        {
            var post = await _context.Posts.FindAsync(createLikeDTO.PostId);

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            var newLike = new Like
            {
                UserId = createLikeDTO.UserId,
                PostId = createLikeDTO.PostId,
            };

            _context.Likes.Add(newLike);

            post.LikeCount++; // Increment the LikesCount

            await _context.SaveChangesAsync();

            return newLike.PostId;
        }

        public async Task<string> UnlikePostAsync(string userId, string postId)
        {
            // Find the like record to remove
            var likeRecord = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

            if (likeRecord == null)
            {
                throw new KeyNotFoundException("Like not found.");
            }

            // Remove the like from the database
            _context.Likes.Remove(likeRecord);

            // Decrement the LikesCount of the post
            var post = await _context.Posts.FindAsync(postId);

            // Technically this should always exist, but we can fail-safe here
            if (post == null)
            {
                throw new InvalidOperationException("Post for existing like not found. Data inconsistency.");
            }

            post.LikeCount = Math.Max(0, post.LikeCount - 1); // prevent negative values

            await _context.SaveChangesAsync();

            return postId;
        }

        public async Task<string> SavePostAsync(SaveRequestDTO createSaveDTO)
        {
            var post = await _context.Posts.FindAsync(createSaveDTO.PostId);

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            var newSave = new Save
            {
                UserId = createSaveDTO.UserId,
                PostId = createSaveDTO.PostId,
            };

            _context.Saves.Add(newSave);

            await _context.SaveChangesAsync();

            return newSave.PostId;
        }

        public async Task<string> UnsavePostAsync(string userId, string postId)
        {
            // Find the save record to remove
            var saveRecord = await _context.Saves
                .FirstOrDefaultAsync(s => s.PostId == postId && s.UserId == userId);

            if (saveRecord == null)
            {
                throw new KeyNotFoundException("Save record not found.");
            }

            // Remove the save from the database
            _context.Saves.Remove(saveRecord);
            await _context.SaveChangesAsync();

            return postId;
        }

        public async Task<int> GetLikeCountAsync(string postId)
        {
            var post = await _context.Posts
                    .Where(p => p.PostId == postId)
                    .FirstOrDefaultAsync();

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            return post.LikeCount;
        }

        public async Task<GetItineraryDetailsDTO> GetItineraryDetailsAsync(string postId)
        {
            // Fetch the itinerary steps and accommodations for the given post ID
            var itineraryDetails = new GetItineraryDetailsDTO
            {
                TripSteps = await _context.TripSteps
                    .Where(ts => ts.PostId == postId)
                    .OrderBy(ts => ts.StepNumber) // Ensure steps are ordered
                    .Select(ts => new GetItineraryDetailsTripStepDTO
                    {
                        TripStepId = ts.TripStepId,
                        StepNumber = ts.StepNumber,
                        Latitude = ts.Latitude,
                        Longitude = ts.Longitude,
                        Zoom = ts.Zoom,
                        Price = ts.Price,
                        Description = ts.Description,
                        MediaUrls = ts.Media.Select(m => new MediaDTO
                        {
                            Url = m.AppwriteFileUrl,
                            Type = m.MediaType
                        }).ToList()
                    })
                    .ToListAsync(),

                Accommodations = await _context.Accommodations
                    .Where(a => a.PostId == postId)
                    .Select(a => new GetItineraryDetailsAccommodationDTO
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
                throw new KeyNotFoundException("No itinerary details found for this post.");
            }

            // Return the itinerary details
            return itineraryDetails;
        }

        public async Task<(List<PostSearchResultDTO> Posts, bool HasMore)> SearchPostsAsync(string searchTerm, int page = 1, int pageSize = 10)
        {
            var query = _context.Posts
                .Where(p => p.Caption.ToLower().Contains(searchTerm.ToLower())
                        || p.Tags.ToLower().Contains(searchTerm.ToLower())
                        || p.Body.ToLower().Contains(searchTerm.ToLower()));

            var totalMatchingPosts = await query.CountAsync();

            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostSearchResultDTO
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Caption = p.Caption,
                    MediaUrls = p.Media.Select(m => new MediaDTO { Url = m.AppwriteFileUrl, Type = m.MediaType }).ToList(),
                    LikeCount = p.LikeCount,
                })
                .ToListAsync();

            bool hasMore = (page * pageSize) < totalMatchingPosts;

            return (posts, hasMore);
        }

        public void ImportPostsFromCsv()
        {
            _context.Database.SetCommandTimeout(180); // Timeout in seconds

            string csvFilePath = Path.Combine(Directory.GetCurrentDirectory(), "posts.csv");
            string mediaFilePath = Path.Combine(Directory.GetCurrentDirectory(), "file-urls.txt");

            if (!File.Exists(csvFilePath))
                throw new FileNotFoundException("CSV file not found.");

            if (!File.Exists(mediaFilePath))
                throw new FileNotFoundException("Media file list not found.");

            // Load all media file URLs
            var photoUrls = File.ReadAllLines(mediaFilePath)
                                .Where(url => !string.IsNullOrWhiteSpace(url))
                                .ToList();

            if (photoUrls.Count == 0)
                throw new Exception("No photo URLs found.");

            // get all user ids
            var userIds = _context.Users
                .Select(u => u.UserId)
                .ToList();

            var random = new Random();

            using (var reader = new StreamReader(csvFilePath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                var posts = csv.GetRecords<PostCsvModel>().ToList();

                // Convert CSV data to Post entities
                var newPosts = posts.Select(p =>
                {
                    string generatedPostId = Guid.NewGuid().ToString();
                    string randomUserId = userIds[random.Next(userIds.Count)];

                    // Pick 1–5 random unique photo URLs
                    int photoCount = random.Next(1, 6);
                    var selectedUrls = photoUrls.OrderBy(x => random.Next()).Take(photoCount).ToList();

                    return new Post
                    {
                        PostId = generatedPostId,
                        UserId = randomUserId,
                        Caption = p.Caption.Length > 2200 ? p.Caption.Substring(0, 2200) : p.Caption,
                        Body = p.Body.Length > 2200 ? p.Body.Substring(0, 2200) : p.Body,
                        Location = p.Location,
                        Tags = p.Tags,
                        CreatedAt = DateTime.UtcNow,
                        LikeCount = 0,
                        IsItinerary = false,
                        Media = selectedUrls.Select(url => new PostMedia
                        {
                            MediaId = Guid.NewGuid().ToString(),
                            PostId = generatedPostId,
                            AppwriteFileUrl = url,
                            MediaType = "Photo"
                        }).ToList()
                    };
                }).ToList();

                // Add to DB
                _context.Posts.AddRange(newPosts);
                _context.SaveChanges();
            }
        }
    }
}
