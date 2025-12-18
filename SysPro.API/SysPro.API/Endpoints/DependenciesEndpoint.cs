using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;


namespace SysPro.API.Endpoints
{
    public static class DependenciesEndpoint
    {
        public static void MapDependenciesEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/dependencies", async (
                IConfiguration config,
                [FromQuery] string? masterJob = null) =>
            {
                string connString = config.GetConnectionString("DefaultConnection");
                var list = new List<JobDependency>();

                try
                {
                    using var conn = new SqlConnection(connString);
                    using var cmd = new SqlCommand("GetJobDependencies", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 30; 

                    await conn.OpenAsync();

                    using var reader = await cmd.ExecuteReaderAsync();

                    int rowCount = 0;
                    while (await reader.ReadAsync())
                    {
                        rowCount++;
                        var dependency = new JobDependency
                        {
                            DependentJob = reader["DependentJob"]?.ToString() ?? "",
                            DependentDescription = reader["DependentDescription"]?.ToString() ?? "",
                            JobType = reader["JobType"]?.ToString() ?? "",
                            MasterJob = reader["MasterJob"]?.ToString() ?? ""
                        };

                        if (string.IsNullOrEmpty(masterJob))
                        {
                            list.Add(dependency);
                        }
                        else
                        {
                            string cleanMasterFromDb = CleanJobId(dependency.MasterJob);
                            string cleanMasterFromQuery = CleanJobId(masterJob);

                            if (cleanMasterFromDb == cleanMasterFromQuery)
                            {
                                list.Add(dependency);
                            }
                            else
                            {
                                //
                            }
                        }
                    }

                    if (list.Count > 0)
                    {
                        foreach (var dep in list)
                        {
                            //
                        }
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ No dependencies found matching criteria");
                    }

                    return Results.Ok(list);
                }
                catch (SqlException sqlEx)
                {
                    return Results.Problem(
                        detail: $"Database error: {sqlEx.Message}",
                        statusCode: 500,
                        title: "Database Error"
                    );
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: $"Server error: {ex.Message}",
                        statusCode: 500,
                        title: "Server Error"
                    );
                }
            })
            .WithTags("Dependencies")
            .Produces<List<JobDependency>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status500InternalServerError)
            .AllowAnonymous()
            .RequireCors("AllowFrontend");
        }
        private static string CleanJobId(string? jobId)
        {
            if (string.IsNullOrEmpty(jobId))
                return jobId ?? "";

            var cleaned = jobId.TrimStart('0');

            return string.IsNullOrEmpty(cleaned) ? "0" : cleaned;
        }
    }

    public class JobDependency
    {
        public string DependentJob { get; set; } = "";
        public string DependentDescription { get; set; } = "";
        public string JobType { get; set; } = "";
        public string MasterJob { get; set; } = "";
    }
}