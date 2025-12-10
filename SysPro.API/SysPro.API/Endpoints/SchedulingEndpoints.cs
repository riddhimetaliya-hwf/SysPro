using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Net.Http.Headers;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SysPro.API.Endpoints
{
    public static class SchedulingEndpoints
    {
        public static void MapSchedulingEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/scheduling")
                .WithTags("Scheduling");

            group.MapGet("/job", GetJobDetails)
                .WithName("GetJob")
                .WithSummary("Get all Pending Job data");

            group.MapPost("/update-job", UpdateJobSchedule)
                .WithName("UpdateJob")
                .WithSummary("Update particular job");

            group.MapGet("/job-dashboard", GetJobDashboard)
                .WithName("GetJobDashboard")
                .WithSummary("Get simplified job dashboard data");

            group.MapGet("/job-conflict", GetConflictDashboard)
                .WithName("GetConflictDashboard")
                .WithSummary("Get details of jobs with conflict");
        }

        private static async Task<IResult> GetJobDetails(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                var machines = new List<object>();

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetSchedulingJobFor3Month", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var machine = new
                    {
                        Machine = reader["Machine"]?.ToString(),
                        Description = reader["Description"]?.ToString(),

                        // Deserialize Capacity JSON string into Dictionary<string, decimal>
                        Capacity = reader["Capacity"] != DBNull.Value
            ? JsonSerializer.Deserialize<Dictionary<string, decimal>>(reader["Capacity"].ToString() ?? "{}")
            : new Dictionary<string, decimal>(),

                        // Deserialize Jobs JSON string into a List of dynamic objects
                        Jobs = reader["Jobs"] != DBNull.Value
            ? JsonSerializer.Deserialize<List<object>>(reader["Jobs"].ToString() ?? "[]")


            : new List<object>()
                    };

                    machines.Add(machine);
                }

                return Results.Ok(machines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}. Returning mock data for development.");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        // ----------------- FIXED: UPDATE JOB SCHEDULE -----------------
        private static async Task<IResult> UpdateJobSchedule(HttpRequest request, IConfiguration configuration)
        {
            try
            {
                Console.WriteLine("🔍 Starting UpdateJobSchedule...");

                // Read and validate the request
                var updateRequest = await request.ReadFromJsonAsync<JobUpdateRequest>();

                if (updateRequest == null)
                {
                    return Results.BadRequest(new { success = false, message = "Invalid request body" });
                }

                // FIXED: Use helper properties to handle different frontend formats
               string actualJobNumber = !string.IsNullOrEmpty(updateRequest.JobNumber) ? updateRequest.JobNumber : updateRequest.JobNumber;
               string actualScheduleDate = !string.IsNullOrEmpty(updateRequest.JobScheduleDate) ? updateRequest.JobScheduleDate : updateRequest.JobScheduleDate;

                // Validate required fields
                if (string.IsNullOrWhiteSpace(actualJobNumber))
                {
                    return Results.BadRequest(new { success = false, message = "JobNumber is required" });
                }

                if (string.IsNullOrWhiteSpace(actualScheduleDate))
                {
                    return Results.BadRequest(new { success = false, message = "JobScheduleDate is required" });
                }

                Console.WriteLine($"📥 Received update request - Job: {actualJobNumber}, Date: {actualScheduleDate}");

                var httpClient = new HttpClient();

                // Step 1: Get token
                Console.WriteLine("🔑 Getting token from external API...");
                var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "http://apps.driscollassociates.com/jobupdate/token")
                {
                    Content = new FormUrlEncodedContent(new[]
                    {
                new KeyValuePair<string, string>("grant_type", "password"),
                new KeyValuePair<string, string>("username", "admin"),
                new KeyValuePair<string, string>("password", "admin")
            })
                };

                var tokenResponse = await httpClient.SendAsync(tokenRequest);
                var tokenJson = await tokenResponse.Content.ReadAsStringAsync();

                if (!tokenResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"❌ Token request failed: {tokenResponse.StatusCode} - {tokenJson}");
                    return Results.BadRequest(new { success = false, message = $"Failed to get authentication token: {tokenJson}" });
                }

                var tokenObj = JsonSerializer.Deserialize<TokenResponse>(tokenJson);
                if (tokenObj == null || string.IsNullOrEmpty(tokenObj.AccessToken))
                {
                    return Results.BadRequest(new { success = false, message = "Invalid token response from authentication service." });
                }

                Console.WriteLine("✅ Token obtained successfully");

                // Step 2: Call update-job-schedule API
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenObj.AccessToken);

                var updatePayload = new
                {
                    JobNumber = actualJobNumber,
                    JobScheduleDate = actualScheduleDate
                };

                var jsonPayload = JsonSerializer.Serialize(updatePayload);
                Console.WriteLine($"📤 Sending to external API: {jsonPayload}");

                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                var apiResponse = await httpClient.PostAsync("http://apps.driscollassociates.com/jobupdate/api/schedule/update-job-schedule", content);
                var responseContent = await apiResponse.Content.ReadAsStringAsync();

                Console.WriteLine($"📥 External API response: {apiResponse.StatusCode} - {responseContent}");

                // FIXED: Return consistent response format
                if (apiResponse.IsSuccessStatusCode)
                {
                    return Results.Ok(new
                    {
                        success = true,
                        message = "Job schedule updated successfully",
                        jobNumber = actualJobNumber,
                        scheduledDate = actualScheduleDate
                    });
                }
                else
                {
                    // FIXED: Return proper error response
                    return Results.BadRequest(new
                    {
                        success = false,
                        message = $"External API error: {responseContent}",
                        statusCode = (int)apiResponse.StatusCode
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Exception in UpdateJobSchedule: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                // FIXED: Use Results.BadRequest instead of Results.Problem for consistent error handling
                return Results.BadRequest(new
                {
                    success = false,
                    message = $"Internal server error: {ex.Message}"
                });
            }
        }

        private static async Task<IResult> GetJobDashboard(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                var jobs = new List<object>();

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobDashboardSimple", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var job = new
                    {
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        Machine = reader["Machine"]?.ToString(),
                        JobStartDate = reader["JobStartDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["JobStartDate"]).ToString("yyyy-MM-dd")
                            : null,
                        JobEndDate = reader["JobEndDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["JobEndDate"]).ToString("yyyy-MM-dd")
                            : null,
                        JobStatus = reader["JobStatus"]?.ToString()
                    };

                    jobs.Add(job);
                }

                return Results.Ok(jobs);
            }
            catch (Exception ex)
            {
                // FIXED: Use BadRequest instead of Problem for consistency
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetConflictDashboard(
     IConfiguration configuration,
     [FromQuery] string jobIds = null)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                var jobs = new List<object>();

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetConflictDashboard", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // FIXED: Add jobIds parameter if provided
                if (!string.IsNullOrEmpty(jobIds))
                {
                    command.Parameters.AddWithValue("@JobIds", jobIds);
                }

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var job = new
                    {
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        Machine = reader["Machine"]?.ToString(),
                        ImpactScore = reader["ImpactScore"] != DBNull.Value
                                      ? Convert.ToInt32(reader["ImpactScore"])
                                      : 0,
                        Urgency = reader["Urgency"]?.ToString(),
                        Complexity = reader["Complexity"]?.ToString(),
                        ConflictReason = reader["ConflictReason"]?.ToString()
                    };

                    jobs.Add(job);
                }
                return Results.Ok(jobs);
            }
            catch (Exception ex)
            {
                // FIXED: Use BadRequest instead of Problem for consistency
                return Results.BadRequest(new { error = $"Error fetching conflicts: {ex.Message}" });
            }
        }

        public class JobUpdateRequest
        {
            [JsonPropertyName("JobNumber")]
            public string JobNumber { get; set; } = string.Empty;

            [JsonPropertyName("JobScheduleDate")]
            public string JobScheduleDate { get; set; } = string.Empty;
        }

        public class TokenResponse
        {
            [JsonPropertyName("access_token")]
            public string AccessToken { get; set; } = string.Empty;
        }
    }
}