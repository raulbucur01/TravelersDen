using BackendAPI.DTOs.Comments;
using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
{
    public class CommentService
    {
        private readonly AppDbContext _context;

        public CommentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> CreateCommentAsync(CreateCommentDTO commentDto)
        {
            var comment = new Comment
            {
                UserId = commentDto.UserId,
                PostId = commentDto.PostId,
                Mention = commentDto.Mention,
                MentionedUserId = commentDto.MentionedUserId,
                Body = commentDto.Body,
                ParentCommentId = commentDto.ParentCommentId,  // Can be null for top-level comments
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            await _context.SaveChangesAsync();

            return comment.PostId;
        }

        public async Task<List<CommentDTO>> GetCommentsForPostAsync(string postId)
        {
            var comments = await _context.Comments
                    .Where(c => c.PostId == postId && c.ParentCommentId == null)  // Get top-level comments
                    .OrderBy(c => c.CreatedAt)  // Order by creation time
                    .Select(c => new CommentDTO
                    {
                        CommentId = c.CommentId,
                        PostId = c.PostId,
                        Body = c.Body,
                        CreatedAt = c.CreatedAt.ToLocalTime().ToString("o"),
                        LikeCount = c.LikeCount,
                        User = new CommentUserDTO
                        {
                            UserId = c.User.UserId,
                            Username = c.User.Username,
                            ImageUrl = c.User.ImageUrl,
                            Name = c.User.Name
                        },
                        Replies = _context.Comments
                            .Where(reply => reply.ParentCommentId == c.CommentId)  // Get replies to the current comment
                            .OrderBy(reply => reply.CreatedAt)
                            .Select(reply => new CommentReplyDTO
                            {
                                CommentId = reply.CommentId,
                                PostId = reply.PostId,
                                ParentCommentId = reply.ParentCommentId,
                                Mention = reply.Mention,
                                MentionedUserId = reply.MentionedUserId,
                                Body = reply.Body,
                                CreatedAt = reply.CreatedAt.ToLocalTime().ToString("o"),
                                LikeCount = reply.LikeCount,
                                User = new CommentUserDTO
                                {
                                    UserId = reply.User.UserId,
                                    Username = reply.User.Username,
                                    ImageUrl = reply.User.ImageUrl,
                                    Name = reply.User.Name
                                }
                            })
                            .ToList()
                    })
                    .ToListAsync();

            return comments;
        }

        public async Task<string> DeleteCommentAsync(string commentId)
        {
            var comment = await _context.Comments
                    .Include(c => c.Replies) // Include replies for cascading delete
                    .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            string postId = comment.PostId;

            // Recursively delete replies first
            foreach (var reply in comment.Replies)
            {
                _context.Comments.Remove(reply);
            }

            // Remove the comment itself
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return postId;
        }

        public async Task<string> EditCommentAsync(string commentId, EditCommentDTO editCommentDto)
        {
            var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            comment.Body = editCommentDto.Body;
            comment.Mention = editCommentDto.Mention;
            comment.MentionedUserId = editCommentDto.MentionedUserId;
            comment.CreatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return comment.PostId;
        }

        public async Task<List<string>> GetCommentLikesAsync(string commentId)
        {
            var likes = await _context.CommentLikes
                    .Where(like => like.CommentId == commentId)
                    .Select(like => like.UserId)
                    .ToListAsync();

            return likes;
        }

        public async Task LikeCommentAsync(CommentLikeRequestDTO createLikeDTO)
        {
            var existingLike = await _context.CommentLikes
                    .FirstOrDefaultAsync(cl => cl.UserId == createLikeDTO.UserId && cl.CommentId == createLikeDTO.CommentId);

            if (existingLike != null)
            {
                throw new InvalidOperationException("User has already liked this comment.");
            }

            var newLike = new CommentLike
            {
                UserId = createLikeDTO.UserId,
                CommentId = createLikeDTO.CommentId,
            };

            _context.CommentLikes.Add(newLike);

            var comment = await _context.Comments.FindAsync(createLikeDTO.CommentId);

            if (comment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            comment.LikeCount++;

            await _context.SaveChangesAsync();
        }

        public async Task UnlikeCommentAsync(string userId, string commentId)
        {
            // Find the like record to remove
            var likeRecord = await _context.CommentLikes
                    .FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == userId);

            if (likeRecord == null)
            {
                throw new KeyNotFoundException("Like not found.");
            }

            // Remove the like from the database
            _context.CommentLikes.Remove(likeRecord);

            var comment = await _context.Comments.FindAsync(commentId);

            if (comment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            comment.LikeCount--;

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetLikeCountAsync(string commentId)
        {
            var comment = await _context.Comments
                    .Where(p => p.CommentId == commentId)
                    .FirstOrDefaultAsync();

            if (comment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            return comment.LikeCount;
        }
    }
}
