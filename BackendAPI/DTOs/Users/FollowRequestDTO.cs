namespace BackendAPI.DTOs.Users
{
    public class FollowRequestDTO
    {
        public string UserIdFollowing { get; set; }
        public string UserIdFollowed { get; set; }
    }
}
