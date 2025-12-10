using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SysPro.API.Endpoints
{
    public static class ERPIntegrationEndpoint
    {
        public static void MapERPIntegrationEndpoint(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/erpintegration")
                .WithTags("ERPIntegration");

            group.MapGet("/inventory", GetInventory)
                .WithName("Inventory")
                .WithSummary("Show Inventory Data");

            group.MapGet("/job-material-readiness", GetJobMaterialReadiness)
                .WithName("JobMaterialReadiness")
                .WithSummary("Show Job Material Readiness Data");
        }

        private static async Task<IResult> GetInventory(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetProductInventoryDetails", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var sb = new System.Text.StringBuilder();

                while (await reader.ReadAsync())
                {
                    if (!reader.IsDBNull(0))
                    {
                        sb.Append(reader.GetString(0));
                    }
                }

                string jsonResult = sb.ToString();

                if (string.IsNullOrWhiteSpace(jsonResult))
                {
                    return Results.Ok(new List<object>());
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var products = JsonSerializer.Deserialize<List<ProductInventory>>(jsonResult, options)
                               ?? new List<ProductInventory>();

                return Results.Ok(products);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new
                {
                    error = ex.Message
                });
            }
        }

        private static async Task<IResult> GetJobMaterialReadiness(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetJobMaterialReadiness", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var jobs = new List<JobMaterialReadiness>();

                while (await reader.ReadAsync())
                {
                    jobs.Add(new JobMaterialReadiness
                    {
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        StockCode = reader["StockCode"]?.ToString(),
                        StockDescription = reader["StockDescription"]?.ToString(),
                        QtyToMake = reader["QtyToMake"] != DBNull.Value ? Convert.ToDecimal(reader["QtyToMake"]) : 0,
                        QtyManufactured = reader["QtyManufactured"] != DBNull.Value ? Convert.ToDecimal(reader["QtyManufactured"]) : 0,
                        MaterialStatus = reader["MaterialStatus"]?.ToString(),
                        MissingMaterials = reader["MissingMaterials"]?.ToString()
                    });
                }

                return Results.Ok(jobs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new
                {
                    error = ex.Message
                });
            }
        }


        public class ProductInventory
        {
            public string StockCode { get; set; }
            public string ProductName { get; set; }
            public string Source { get; set; }
            public decimal QuantityOnHand { get; set; }
            public decimal TotalPrice { get; set; }
            public decimal QuantityRequired { get; set; }
        }

        public class JobMaterialReadiness
        {
            public string Job { get; set; }
            public string JobDescription { get; set; }
            public string StockCode { get; set; }
            public string StockDescription { get; set; }
            public decimal QtyToMake { get; set; }
            public decimal QtyManufactured { get; set; }
            public string MaterialStatus { get; set; }
            public string MissingMaterials { get; set; }
        }
    }
}
