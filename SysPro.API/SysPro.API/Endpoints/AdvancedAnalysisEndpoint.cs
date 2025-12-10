using Microsoft.Data.SqlClient;
using System.Data;

namespace SysPro.API.Endpoints
{
    public static class AdvancedAnalysisEndpoint
    {
        public static void MapAdvancedAnalysisEndpoint(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/advanced-analysis")
                .WithTags("Advanced Analysis");

            group.MapGet("/performance-analytics", GetPerformanceAnalytics)
                .WithName("GetPerformanceAnalytics")
                .WithSummary("Get KPIs and Machine performance analytics");

            group.MapDelete("/machine/{workCentre}", DeleteMachineMetric)
                .WithName("DeleteMachineMetric")
                .WithSummary("Delete machine metric by WorkCentre");

        }

        private static async Task<IResult> GetPerformanceAnalytics(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetPerformanceAnalytics", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                // ==========================
                // 1. Read KPI Result Set
                // ==========================
                object? kpis = null;
                if (await reader.ReadAsync())
                {
                    kpis = new
                    {
                        OverallEquipmentEffectiveness = reader["OverallEquipmentEffectiveness"] != DBNull.Value ? Convert.ToDecimal(reader["OverallEquipmentEffectiveness"]) : 0,
                        ResourceUtilization = reader["ResourceUtilization"] != DBNull.Value ? Convert.ToDecimal(reader["ResourceUtilization"]) : 0,
                        OnTimeDelivery = reader["OnTimeDelivery"] != DBNull.Value ? Convert.ToDecimal(reader["OnTimeDelivery"]) : 0,
                        ScheduleEfficiency = reader["ScheduleEfficiency"] != DBNull.Value ? Convert.ToDecimal(reader["ScheduleEfficiency"]) : 0
                    };
                }

                // ==========================
                // 2. Move to Machine Metrics
                // ==========================
                await reader.NextResultAsync();
                var machines = new List<object>();
                while (await reader.ReadAsync())
                {
                    machines.Add(new
                    {
                        WorkCentre = reader["WorkCentre"]?.ToString(),
                        WorkCentreDesc = reader["WorkCentreDesc"]?.ToString(),
                        Utilization = reader["Utilization"] != DBNull.Value ? Convert.ToDecimal(reader["Utilization"]) : 0,
                        QueueLength = reader["QueueLength"] != DBNull.Value ? Convert.ToInt32(reader["QueueLength"]) : 0,
                        AvgWaitTime = reader["AvgWaitTime"] != DBNull.Value ? Convert.ToInt32(reader["AvgWaitTime"]) : 0,
                        ImpactScore = reader["ImpactScore"] != DBNull.Value ? Convert.ToDecimal(reader["ImpactScore"]) : 0,
                        Status = reader["Status"]?.ToString()
                    });
                }

                return Results.Ok(new
                {
                    KPIs = kpis,
                    MachineMetrics = machines
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching performance analytics: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }

        // Delete Machine Matric
        private static async Task<IResult> DeleteMachineMetric(string workCentre, IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                // ⚠️ Replace with your actual table name that stores machine metrics
                var sql = "DELETE FROM MachineMetrics WHERE WorkCentre = @WorkCentre";

                using var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@WorkCentre", workCentre);

                int rowsAffected = await command.ExecuteNonQueryAsync();

                if (rowsAffected > 0)
                    return Results.Ok(new { message = $"Machine metric for WorkCentre '{workCentre}' deleted successfully." });
                else
                    return Results.NotFound(new { message = $"No machine metric found for WorkCentre '{workCentre}'." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting machine metric: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }   
    }
}
