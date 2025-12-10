using Microsoft.Data.SqlClient;
using System.Data;
using System.Net.Http.Headers;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SysPro.API.Endpoints
{
    public static class SmartAlerts
    {
        public static void MapSmartAlertsEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/smart-alert")
                .WithTags("Smart Alert");

            group.MapGet("/alert", GetAlerts)
                .WithTags("Alerts")
                .WithSummary("Get API for smart alerts");
        }

        private static async Task<IResult> GetAlerts(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                var alerts = new List<object>();

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetSmartAlerts", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    alerts.Add(new
                    {
                        Job = reader["Job"],
                        StockCode = reader["StockCode"],
                        StockDescription = reader["StockDescription"],
                        MaterialPresent = reader["MaterialPresent"],
                        MaterialRequired = reader["MaterialRequired"],
                        ImpactScore = reader["ImpactScore"]
                    });
                }

                return Results.Ok(alerts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.Problem("Error fetching smart alerts.");
            }
        }
    }
}
