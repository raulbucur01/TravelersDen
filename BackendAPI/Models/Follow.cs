namespace BackendAPI.Models
{
    public class Follow
    {
        public string UserIdFollowing { get; set; }
        public User FollowingUser { get; set; }  

        public string UserIdFollowed { get; set; }
        public User FollowedUser { get; set; }  

        public DateTime FollowedAt { get; set; }
    }
}
