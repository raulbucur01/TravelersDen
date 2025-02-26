using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TravelAppBackendAPI.DTOs;
using TravelAppBackendAPI.Models;

namespace TravelAppBackendAPI.Services
{
    public class FastApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _fastApiBaseUrl;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public FastApiService(HttpClient httpClient, IOptions<FastApiSettings> fastApiSettings)
        {
            _httpClient = httpClient;
            _fastApiBaseUrl = fastApiSettings.Value.BaseUrl;
        }

        public async Task<SimilarPostsResponseDTO?> GetSimilarPostsAsync(string postId)
        {
            try
            {
                string fastApiUrl = $"{_fastApiBaseUrl}/similar_posts/{postId}";
                HttpResponseMessage response = await _httpClient.GetAsync(fastApiUrl);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to fetch similar posts. Status: {response.StatusCode}");
                }

                string responseContent = await response.Content.ReadAsStringAsync();

                return JsonSerializer.Deserialize<SimilarPostsResponseDTO>(responseContent, _jsonOptions);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error: {ex.Message}");
            }
        }
    }
}
