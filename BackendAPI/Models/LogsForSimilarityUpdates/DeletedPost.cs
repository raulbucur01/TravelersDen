namespace BackendAPI.Models.LogsForSimilarityUpdates
{
    public class DeletedPost
    {
        public string DeletionId { get; set; } = Guid.NewGuid().ToString();
        public string PostId { get; set; }
        public DateTime DeleteTime { get; set; } = DateTime.UtcNow;
        public bool Processed { get; set; } = false; // ✅ Tracks which deletions are handled
    }
}
