using Microsoft.Data.SqlClient;
using System.Data;
using System.Net.Http.Headers;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SysPro.API.Endpoints
{
    public static class RulesEnginEndpoints
    {
        public static void MapRuleEngineEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/rule-engine")
                .WithTags("Rule Engine");

            group.MapGet("/dashboard", GetRulesDashboard)
                .WithName("GetRulesDashboard")
                .WithSummary("Get rules engine dashboard results (priority jobs & machine cooldowns)");

            // ✅ New DELETE endpoint
            group.MapDelete("/job/{jobId}", DeleteRuleByJob)
                .WithName("DeleteRuleByJob")
                .WithSummary("Delete a rule from the rules engine by Job ID");

            //group.MapPost("/job/dashboard", PostCreateRule)
            //    .WithName("PostCreateRule")
            //    .WithSummary("Add data");
        }

        private static async Task<IResult> GetRulesDashboard(IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.GetRulesEngineDashboard", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                // ==========================
                // 1. Read KPI Summary
                // ==========================
                var kpis = new
                {
                    TotalRules = 0,
                    ActiveRules = 0,
                    Automations = 0,
                    HighPriority = 0
                };

                if (await reader.ReadAsync())
                {
                    kpis = new
                    {
                        TotalRules = reader["TotalRules"] != DBNull.Value ? Convert.ToInt32(reader["TotalRules"]) : 0,
                        ActiveRules = reader["ActiveRules"] != DBNull.Value ? Convert.ToInt32(reader["ActiveRules"]) : 0,
                        Automations = reader["Automations"] != DBNull.Value ? Convert.ToInt32(reader["Automations"]) : 0,
                        HighPriority = reader["HighPriority"] != DBNull.Value ? Convert.ToInt32(reader["HighPriority"]) : 0
                    };
                }

                // Move to the next result set (detailed rules)
                await reader.NextResultAsync();

                // ==========================
                // 2. Read Detailed Rules
                // ==========================
                var rules = new List<object>();
                while (await reader.ReadAsync())
                {
                    rules.Add(new
                    {
                        RuleName = reader["RuleName"]?.ToString(),
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        ConditionValue = reader["ConditionValue"]?.ToString(),
                        Reason = reader["Reason"]?.ToString(),
                        IsActive = reader["IsActive"] != DBNull.Value && Convert.ToBoolean(reader["IsActive"]),
                        IsAutomation = reader["IsAutomation"] != DBNull.Value && Convert.ToBoolean(reader["IsAutomation"])
                    });
                }

                // ==========================
                // 3. Return combined response
                // ==========================
                return Results.Ok(new
                {
                    KPIs = kpis,
                    Rules = rules
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database error: {ex.Message}");
                return Results.BadRequest(new { error = ex.Message });
            }
        }

        // ==========================
        // DELETE Rule by RuleName
        // ==========================
        private static async Task<IResult> DeleteRuleByJob(string jobId, IConfiguration configuration)
        {
            try
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                using var connection = new SqlConnection(connectionString);
                using var command = new SqlCommand("dbo.DeleteRuleByJob", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@JobId", jobId);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                var results = new List<object>();
                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        RuleName = reader["RuleName"]?.ToString(),
                        Job = reader["Job"]?.ToString(),
                        JobDescription = reader["JobDescription"]?.ToString(),
                        ConditionValue = reader["ConditionValue"]?.ToString(),
                        Reason = reader["Reason"]?.ToString()
                    });
                }

                return Results.Ok(new { message = $"Rule with Job ID '{jobId}' excluded.", remainingRules = results });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error excluding rule: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }

        private static async Task<IResult> PostCreateRule(IConfiguration configuration)
        {
            return await PostCreateRule(configuration);
        }

        //private static async Task<IResult> PostRulesDashboard(IConfiguration configuration)
        //{
        //    // ✅ Reuse same logic as GET
        //    return await GetRulesDashboard(configuration);
        //}
    }
}
