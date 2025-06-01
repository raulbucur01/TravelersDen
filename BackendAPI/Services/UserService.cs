using Appwrite;
using BackendAPI.DTOs.FastApiRelated;
using BackendAPI.DTOs.Users;
using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly FastApiService _fastApiService;

        public UserService(AppDbContext context, FastApiService fastApiService)
        {
            _context = context;
            _fastApiService = fastApiService;
        }

        public async Task<User> ValidateCredentialsAndGetUser(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            return user;
        }

        public async Task<User> RegisterUser(User user)
        {
            // If user body is invalid
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user), "User cant be null");
            }

            // If user is already registered
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email || u.Username == user.Username);

            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email or username already exists");
            }

            // hash the password
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateUserAsync(string userId, UpdateUserDTO updateUserDto)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            user.Name = updateUserDto.Name;
            user.Username = updateUserDto.Username;
            user.Bio = updateUserDto.Bio;
            user.ImageUrl = updateUserDto.ImageUrl;

            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<GetUserByIdDTO> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new GetUserByIdDTO
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Username = u.Username,
                    Email = u.Email,
                    Bio = u.Bio ?? "",
                    ImageUrl = u.ImageUrl,
                    FollowerCount = u.FollowerCount,
                    FollowingCount = u.FollowingCount,
                    PostCount = u.PostCount,
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return user;
        }

        public async Task<string> DeleteUserAsync(string userId)
        {
            // Find the user
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            // Remove all follows where the user is involved
            var follows = _context.Follows
                .Where(f => f.UserIdFollowing == userId || f.UserIdFollowed == userId);

            _context.Follows.RemoveRange(follows);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return userId;
        }

        public async Task<(List<FollowerDTO> Followers, bool HasMore)> GetFollowersAsync(string userId, int page, int pageSize)
        {
            var totalFollowers = await _context.Follows
                .Where(f => f.UserIdFollowed == userId)
                .CountAsync();

            var followers = await _context.Follows
                .Where(f => f.UserIdFollowed == userId)
                .OrderByDescending(f => f.FollowedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new FollowerDTO
                {
                    UserId = f.FollowingUser.UserId,
                    Name = f.FollowingUser.Name,
                    Username = f.FollowingUser.Username,
                    ImageUrl = f.FollowingUser.ImageUrl
                })
                .ToListAsync();

            bool hasMore = (page * pageSize) < totalFollowers;
            return (followers, hasMore);
        }

        public async Task<(List<FollowerDTO> Following, bool HasMore)> GetFollowingAsync(string userId, int page, int pageSize)
        {
            var totalFollowing = await _context.Follows
                .Where(f => f.UserIdFollowing == userId)
                .CountAsync();

            var following = await _context.Follows
                .Where(f => f.UserIdFollowing == userId)
                .OrderByDescending(f => f.FollowedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new FollowerDTO
                {
                    UserId = f.FollowedUser.UserId,
                    Name = f.FollowedUser.Name,
                    Username = f.FollowedUser.Username,
                    ImageUrl = f.FollowedUser.ImageUrl
                })
                .ToListAsync();

            bool hasMore = (page * pageSize) < totalFollowing;
            return (following, hasMore);
        }

        public async Task<(List<UserPostPreviewDTO> Posts, bool HasMore)> GetUserPostsAsync(string userId, int page, int pageSize)
        {
            var totalPosts = await _context.Posts
                .Where(p => p.UserId == userId)
                .CountAsync();

            var posts = await _context.Posts
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new UserPostPreviewDTO
                {
                    PostId = p.PostId,
                    FirstMediaUrl = p.Media
                        .Select(m => m.AppwriteFileUrl)
                        .FirstOrDefault(),
                    IsItinerary = p.IsItinerary
                })
                .ToListAsync();

            bool hasMore = (page * pageSize) < totalPosts;
            return (posts, hasMore);
        }

        public async Task<(string FollowerId, string FollowedId)> CreateFollowAsync(FollowRequestDTO followDto)
        {
            // Check if users exist
            var users = await _context.Users
                .Where(u => u.UserId == followDto.UserIdFollowing || u.UserId == followDto.UserIdFollowed)
                .ToListAsync();

            var userFollowing = users.FirstOrDefault(u => u.UserId == followDto.UserIdFollowing);
            var userFollowed = users.FirstOrDefault(u => u.UserId == followDto.UserIdFollowed);

            if (userFollowing == null || userFollowed == null)
            {
                throw new KeyNotFoundException("One or both users not found.");
            }

            // Check for existing follow
            var alreadyFollowing = await _context.Follows.AnyAsync(f =>
                f.UserIdFollowing == followDto.UserIdFollowing &&
                f.UserIdFollowed == followDto.UserIdFollowed);

            if (alreadyFollowing)
            {
                throw new InvalidOperationException("Already following this user.");
            }

            // Add new follow
            var newFollow = new Follow
            {
                UserIdFollowing = followDto.UserIdFollowing,
                UserIdFollowed = followDto.UserIdFollowed,
                FollowedAt = DateTime.UtcNow
            };

            _context.Follows.Add(newFollow);

            // Update counters
            userFollowed.FollowerCount++;
            userFollowing.FollowingCount++;

            await _context.SaveChangesAsync();

            return (followDto.UserIdFollowing, followDto.UserIdFollowed);
        }

        public async Task<(string UnfollowerId, string UnfollowedId)> RemoveFollowAsync(string unfollowerId, string unfollowedId)
        {
            var followRecord = await _context.Follows.FirstOrDefaultAsync(f =>
                f.UserIdFollowing == unfollowerId &&
                f.UserIdFollowed == unfollowedId);

            if (followRecord == null)
            {
                throw new KeyNotFoundException("Follow not found.");
            }

            _context.Follows.Remove(followRecord);

            var users = await _context.Users
                .Where(u => u.UserId == unfollowerId || u.UserId == unfollowedId)
                .ToListAsync();

            var userUnfollowing = users.FirstOrDefault(u => u.UserId == unfollowerId);
            var userFollowed = users.FirstOrDefault(u => u.UserId == unfollowedId);

            if (userUnfollowing == null || userFollowed == null)
            {
                throw new KeyNotFoundException("One or both users not found.");
            }

            userFollowed.FollowerCount = Math.Max(0, userFollowed.FollowerCount - 1);
            userUnfollowing.FollowingCount = Math.Max(0, userUnfollowing.FollowingCount - 1);

            await _context.SaveChangesAsync();

            return (unfollowerId, unfollowedId);
        }

        public async Task<bool> IsUserFollowingAsync(string followerId, string followedId)
        {
            return await _context.Follows
                .AnyAsync(f => f.UserIdFollowing == followerId && f.UserIdFollowed == followedId);
        }

        public async Task<List<SimilarUserDTO>> GetSimilarUsersAsync(string userId)
        {
            var similarUsersResponse = await _fastApiService.GetSimilarUsersAsync(userId);

            if (similarUsersResponse == null)
            {
                throw new InvalidOperationException("Error getting similar users from FastAPI");
            }

            var similarUserIds = similarUsersResponse.SimilarUserIds;

            // Get IDs the current user follows
            var followedUserIds = await _context.Follows
                .Where(f => f.UserIdFollowing == userId)
                .Select(f => f.UserIdFollowed)
                .ToListAsync();

            // If no similar users are found, return randomly selected users
            if (!similarUserIds.Any())
            {
                var randomUsers = await _context.Users
                // ensure we dont select the current user or already followed users
                    .Where(u => u.UserId != userId && !followedUserIds.Contains(u.UserId))
                    .OrderBy(u => u.UserId)  // Order by UserId to ensure randomness
                    .Take(10)
                    .Select(u => new SimilarUserDTO
                    {
                        UserId = u.UserId,
                        Name = u.Name,
                        Username = u.Username,
                        Email = u.Email,
                        ImageUrl = u.ImageUrl,
                        Bio = u.Bio,
                        FollowedBy = _context.Follows
                            .Where(f => f.UserIdFollowed == u.UserId && followedUserIds.Contains(f.UserIdFollowing))
                            .Select(f => _context.Users
                                .Where(us => us.UserId == f.UserIdFollowing)
                                .Select(us => us.Username)
                                .FirstOrDefault())
                            .FirstOrDefault(),

                        MutualCount = _context.Follows
                             .Count(f => f.UserIdFollowed == u.UserId && followedUserIds.Contains(f.UserIdFollowing))

                    })
                    .ToListAsync();

                return randomUsers;
            }

            // NOTE: FastAPI backend already sends user ids that are not the current user and not already followed by the current user,
            // but we still filter them here to ensure the that if a user followed another user after the FastAPI call,
            // they won't appear in the similar users list.
            var similarUsers = await _context.Users
                .Where(u => similarUserIds.Contains(u.UserId) && u.UserId != userId && !followedUserIds.Contains(u.UserId))
                .Select(u => new SimilarUserDTO
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Username = u.Username,
                    Email = u.Email,
                    ImageUrl = u.ImageUrl,
                    Bio = u.Bio,
                    FollowedBy = _context.Follows
                            .Where(f => f.UserIdFollowed == u.UserId && followedUserIds.Contains(f.UserIdFollowing))
                            .Select(f => _context.Users
                                .Where(us => us.UserId == f.UserIdFollowing)
                                .Select(us => us.Username)
                                .FirstOrDefault())
                            .FirstOrDefault(),

                    MutualCount = _context.Follows
                             .Count(f => f.UserIdFollowed == u.UserId && followedUserIds.Contains(f.UserIdFollowing))
                })
                .ToListAsync();

            return similarUsers;
        }
    }
}