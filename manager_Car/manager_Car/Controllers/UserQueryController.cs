using manager_Car.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace manager_Car.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserQueryController : ControllerBase
    {
        private readonly CarManagerContext _carManagerContext;

        public UserQueryController(CarManagerContext carManagerContext)
        {
            _carManagerContext = carManagerContext;
        }
        [HttpGet("getUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _carManagerContext.Users.ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                // Optional: log the exception
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("getUserTransactionsById")]
        public async Task<IActionResult> GetUserTransactionsById(int userId, DateTime? fromDate, DateTime? toDate)
        {
            var sql = @"
                SELECT t.*
                FROM [transaction] t
                JOIN [user] u1 ON t.propose_username = u1.name
                JOIN [user] u2 ON t.receive_username = u2.name
                WHERE (u1.id = @userId OR u2.id = @userId)
                  AND (@fromDate IS NULL OR t.date_time >= @fromDate)
                  AND (@toDate IS NULL OR t.date_time <= @toDate)
                ORDER BY t.date_time DESC";

            var parameters = new[]
            {
                new SqlParameter("@userId", userId),
                new SqlParameter("@fromDate", (object?)fromDate ?? DBNull.Value),
                new SqlParameter("@toDate", (object?)toDate ?? DBNull.Value)
            };

            var transactions = await _carManagerContext.Transactions
                .FromSqlRaw(sql, parameters)
                .ToListAsync();

            var user = await _carManagerContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                // Handle the case when user is not found
                return NotFound($"User with ID {userId} not found.");
            }


            return Ok(new { transactions , user });
        }

    }
}
