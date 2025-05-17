namespace BackendAPI.DTOs.FastApi
{
    public class SimilarUsersResponseDTO
    {
        public string UserId { get; set; }
        public List<string> SimilarUserIds { get; set; }
    }
}
