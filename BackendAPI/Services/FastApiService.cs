﻿using System.Text.Json;
using Microsoft.Extensions.Options;
using BackendAPI.Models;
using BackendAPI.DTOs.FastApiRelated.FastApiService;

namespace BackendAPI.Services
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

        public async Task<SimilarPostsFastApiResponseDTO?> GetSimilarPostsAsync(string postId)
        {
            try
            {
                string fastApiUrl = $"{_fastApiBaseUrl}/similar-posts/{postId}";
                HttpResponseMessage response = await _httpClient.GetAsync(fastApiUrl);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to fetch similar posts. Status: {response.StatusCode}");
                }

                string responseContent = await response.Content.ReadAsStringAsync();

                return JsonSerializer.Deserialize<SimilarPostsFastApiResponseDTO>(responseContent, _jsonOptions);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error: {ex.Message}");
            }
        }

        public async Task<SimilarUsersFastApiResponseDTO?> GetSimilarUsersAsync(string userId)
        {
            try
            {
                string fastApiUrl = $"{_fastApiBaseUrl}/similar-users/{userId}";
                HttpResponseMessage response = await _httpClient.GetAsync(fastApiUrl);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to fetch similar users. Status: {response.StatusCode}");
                }

                string responseContent = await response.Content.ReadAsStringAsync();

                return JsonSerializer.Deserialize<SimilarUsersFastApiResponseDTO>(responseContent, _jsonOptions);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error: {ex.Message}");
            }
        }

        public async Task<GeneratedItineraryFastApiDTO?> GenerateItineraryAsync(string destination, int days, List<string> preferences)
        {
            try
            {
                string fastApiUrl = $"{_fastApiBaseUrl}/generate-itinerary";

                var requestBody = new
                {
                    destination,
                    days,
                    preferences
                };

                HttpResponseMessage response = await _httpClient.PostAsJsonAsync(fastApiUrl, requestBody);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to generate itinerary. Status: {response.StatusCode}");
                }

                string responseContent = await response.Content.ReadAsStringAsync();

                return JsonSerializer.Deserialize<GeneratedItineraryFastApiDTO>(responseContent, _jsonOptions);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error: {ex.Message}");
            }
        }

        public async Task<List<RawItineraryActivityFastApiDTO>> RegenerateDayActivitiesAsync(string destination, List<string> excludedActivities)
        {
            try
            {
                string fastApiUrl = $"{_fastApiBaseUrl}/regenerate-day-activities";

                var requestBody = new
                {
                    destination,
                    excludedActivities
                };

                HttpResponseMessage response = await _httpClient.PostAsJsonAsync(fastApiUrl, requestBody);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to regenerate day activities. Status: {response.StatusCode}");
                }

                string responseContent = await response.Content.ReadAsStringAsync();

                var result = JsonSerializer.Deserialize<List<RawItineraryActivityFastApiDTO>>(responseContent, _jsonOptions);

                return result ?? new List<RawItineraryActivityFastApiDTO>();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error: {ex.Message}");
            }
        }

    }
}
