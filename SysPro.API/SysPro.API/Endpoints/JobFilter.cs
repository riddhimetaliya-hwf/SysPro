using Microsoft.Data.SqlClient;
using System.Data;

namespace SysPro.API.Endpoints
{
    public static class JobFilter
    {
        public static void MapJobFilterEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/jobfilter")
                .WithTags("Job Filter");

            group.MapGet("/smart-search", SmartSearch)
                .WithName("SmartSearch")
                .WithSummary("Smart search for jobs, machines, and materials");

            group.MapGet("/jobs-by-machine", GetJobsByMachine)
                .WithName("GetJobsByMachine")
                .WithSummary("Get jobs by machine or all jobs if machine is not provided");

            group.MapGet("/jobs-by-product", GetJobsByProduct)
                .WithName("GetJobsByProduct")
                .WithSummary("Get jobs by product or all jobs if no product is provided");

            group.MapGet("/jobs-by-material", GetJobsByMaterial)
                .WithName("GetJobsByMaterial")
                .WithSummary("Get jobs by material or all jobs if material is not provided");

            group.MapGet("/jobs-by-crew-skill", GetJobsByCrewSkill)
                .WithName("GetJobsByCrewSkill")
                .WithSummary("Get jobs by crew skill or all jobs if crew skill is not provided");

            group.MapGet("/job-details", GetJobDetails)
                .WithName("GetJobDetails")
                .WithSummary("Get job details for a given job or all jobs if not specified");

            group.MapGet("/job-status", GetJobStatus)
                .WithName("GetJobStatus")
                .WithSummary("Get jobs by status: On Hold, Pending, Complete, or All");

        }

        private static async Task<IResult> SmartSearch(IConfiguration configuration, string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return Results.BadRequest(new { error = "Search term is required." });
                }

                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.SmartSearch", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@SearchTerm", searchTerm);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        JobID = reader["JobID"]?.ToString(),
                        JobName = reader["JobName"]?.ToString(),
                        MachineID = reader["MachineID"]?.ToString(),
                        MachineName = reader["MachineName"]?.ToString(),
                        MaterialID = reader["MaterialID"]?.ToString(),
                        MaterialName = reader["MaterialName"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results instead of 200 with empty array
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobsByMachine(IConfiguration configuration, string? machine)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobsByMachine", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (string.IsNullOrWhiteSpace(machine))
                    command.Parameters.AddWithValue("@Machine", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@Machine", machine);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        Machine = reader["Machine"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobsByProduct(IConfiguration configuration, string? product)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobsByProduct", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (string.IsNullOrWhiteSpace(product))
                    command.Parameters.AddWithValue("@Product", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@Product", product);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        ProductName = reader["ProductName"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobsByMaterial(IConfiguration configuration, string? material)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobsByMaterial", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // Pass NULL if no filter is given
                if (string.IsNullOrWhiteSpace(material))
                    command.Parameters.AddWithValue("@Material", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@Material", material);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        MaterialName = reader["MaterialName"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobsByCrewSkill(IConfiguration configuration, string? crewSkill)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobsByCrewSkill", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (string.IsNullOrWhiteSpace(crewSkill))
                    command.Parameters.AddWithValue("@CrewSkill", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@CrewSkill", crewSkill);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        CrewSkill = reader["CrewSkill"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobDetails(IConfiguration configuration, string? job)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobDetails", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // Pass NULL if no filter is given
                if (string.IsNullOrWhiteSpace(job))
                    command.Parameters.AddWithValue("@Job", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@Job", job);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        ProductCode = reader["ProductCode"]?.ToString(),
                        ProductName = reader["ProductName"]?.ToString(),
                        Machine = reader["Machine"]?.ToString(),
                        CrewSkill = reader["CrewSkill"]?.ToString(),
                        MaterialCode = reader["MaterialCode"]?.ToString(),
                        MaterialName = reader["MaterialName"]?.ToString(),
                        QtyToMake = reader["QtyToMake"]?.ToString(),
                        QtyManufactured = reader["QtyManufactured"]?.ToString(),
                        OperationStatus = reader["OperationStatus"]?.ToString(),
                        UnitQtyReqd = reader["UnitQtyReqd"]?.ToString(),
                        QtyIssued = reader["QtyIssued"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        private static async Task<IResult> GetJobStatus(IConfiguration configuration, string? status)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobStatus", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (string.IsNullOrWhiteSpace(status))
                    command.Parameters.AddWithValue("@Status", DBNull.Value);
                else
                    command.Parameters.AddWithValue("@Status", status);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();

                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        StockCode = reader["StockCode"]?.ToString(),
                        StockDescription = reader["StockDescription"]?.ToString(),
                        CustomerName = reader["CustomerName"]?.ToString(),
                        JobStartDate = reader["JobStartDate"]?.ToString(),
                        JobDeliveryDate = reader["JobDeliveryDate"]?.ToString(),
                        Complete = reader["Complete"]?.ToString(),
                        HoldFlag = reader["HoldFlag"]?.ToString(),
                        JobStatus = reader["JobStatus"]?.ToString()
                    });
                }

                // FIX: Return 204 No Content for empty results
                if (results.Count == 0)
                {
                    return Results.NoContent();
                }

                return Results.Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }
    }
}