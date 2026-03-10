using System.Globalization;
using manager_Car.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml;


namespace manager_Car.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManagerController : ControllerBase
    {
        private readonly CarManagerContext _carManagerContext;

        public ManagerController(CarManagerContext carManagerContext)
        {
            _carManagerContext = carManagerContext;
        }

        [HttpPost("import-transactions")]
        public async Task<IActionResult> ImportTransactions(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            // Create user FLASHCAR if dont exist;
            var userFLASHCAR = await _carManagerContext.Users.FirstOrDefaultAsync(u => u.Name == "FLASHCAR");
            if (userFLASHCAR == null)
            {
                User u_create = new User()
                {
                    Name = "FLASHCAR",
                    Point = 0
                };
                _carManagerContext.Add(u_create);
            }

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;

                    string checkImport = worksheet.Cells[3, 1].Text.ToLower().Trim();

                    DateTime date = new DateTime();
                    var users = await _carManagerContext.Users.ToListAsync();
                    var userNames = users.Select(u => u.Name.ToLower().Trim()).ToHashSet();

                    var transactions = new List<Transaction>();
                    var missingUsers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    switch (checkImport)
                    {
                        case "salary":

                            // Loop through each row, starting from row 2 (assuming headers in row 1)
                            for (int row = 2; row <= rowCount; row++)
                            {
                                try
                                {
                                    if (row == 2 && !string.IsNullOrEmpty(worksheet.Cells[row, 1].Text.Trim()))
                                    {
                                        date = worksheet.Cells[row, 1].GetValue<DateTime>();
                                    }
                                    string dateText = date.ToString("d/M/yyyy");

                                    var usernameCellText = worksheet.Cells[row, 3].Text.Trim();
                                    var pointText = worksheet.Cells[row, 4].Text.Trim();

                                    if (string.IsNullOrEmpty(usernameCellText) && string.IsNullOrEmpty(pointText))
                                    {
                                        break;
                                    }

                                    if (string.IsNullOrEmpty(usernameCellText))
                                    {
                                        Console.WriteLine($"Skipping row {row}: 'Tên column' is empty.");
                                        continue;
                                    }

                                    if (!decimal.TryParse(pointText.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out decimal pointValue))
                                    {
                                        return BadRequest($"Invalid point format at row {row}: '{pointText}'");
                                    }

                                    string proposeUsername;
                                    string receiveUsername;

                                    if (pointValue >= 0)
                                    {
                                        proposeUsername = usernameCellText;
                                        receiveUsername = "FLASHCAR";
                                    }
                                    else
                                    {
                                        proposeUsername = "FLASHCAR";
                                        receiveUsername = usernameCellText;
                                    }

                                    if (!userNames.Contains(usernameCellText.ToLower()))
                                    {
                                        missingUsers.Add(usernameCellText);
                                    }

                                    if (missingUsers.Contains(usernameCellText))
                                    {
                                        continue;
                                    }

                                    var calendarText = worksheet.Cells[row, 5].Text.Trim();

                                    var transaction = new Transaction
                                    {
                                        ProposeUsername = proposeUsername,
                                        ReceiveUsername = receiveUsername,
                                        Point = Math.Abs(pointValue),
                                        DateTime = ParseDateTimeWithTime(dateText, "00:00"),
                                        Calendar1 = calendarText
                                    };

                                    transactions.Add(transaction);

                                    var userAffected = users.FirstOrDefault(u => u.Name.Equals(usernameCellText, StringComparison.OrdinalIgnoreCase));
                                    if (userAffected != null)
                                    {
                                        userAffected.Point += pointValue;
                                        _carManagerContext.Users.Update(userAffected);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    return BadRequest($"Lỗi tại dòng {row}: {ex.Message}");
                                }
                            }

                            if (missingUsers.Count > 0)
                            {
                                return BadRequest("Import thất bại. Các user không tồn tại là: " +
                                                    string.Join(", ", missingUsers));
                            }

                            await _carManagerContext.Transactions.AddRangeAsync(transactions);
                            await _carManagerContext.SaveChangesAsync();
                            return Ok($"Import thành công. Đã thêm {transactions.Count} giao dịch tính lương.");
                        case "transaction":
                            for (int row = 2; row <= rowCount; row += 2)
                            {
                                try
                                {
                                    // Check if the current row (or the pair of rows) is essentially empty
                                    // This is the new stopping condition
                                    var proposeUsernameCheck = worksheet.Cells[row, 3].Text.Trim();
                                    var pointTextCheck = worksheet.Cells[row, 4].Text.Trim();
                                    var receiveUsernameCheck = worksheet.Cells[row + 1, 3].Text.Trim();

                                    if (string.IsNullOrEmpty(proposeUsernameCheck) &&
                                        string.IsNullOrEmpty(pointTextCheck) &&
                                        string.IsNullOrEmpty(receiveUsernameCheck))
                                    {
                                        // If all key fields for this transaction pair are empty, stop processing
                                        break;
                                    }

                                    if (row == 2 && !string.IsNullOrEmpty(worksheet.Cells[row, 1].Text.Trim()))
                                    {
                                        date = worksheet.Cells[row, 1].GetValue<DateTime>();
                                    }
                                    string dateText = date.ToString("d/M/yyyy");

                                    var proposeUsername = proposeUsernameCheck;
                                    var pointText = pointTextCheck;

                                    var timeText = !string.IsNullOrEmpty(worksheet.Cells[row, 5].Text.Trim())
                                        ? worksheet.Cells[row, 5].Text.Trim()
                                        : worksheet.Cells[row + 1, 5].Text.Trim();
                                    if (string.IsNullOrEmpty(timeText))
                                        timeText = "00h00";

                                    var calendar1 = worksheet.Cells[row, 6].Text.Trim();
                                    var receiveUsername = receiveUsernameCheck;
                                    var calendar2 = worksheet.Cells[row + 1, 6].Text.Trim();

                                    // Track unknown usernames
                                    if (!userNames.Contains(proposeUsername.ToLower()))
                                        missingUsers.Add(proposeUsername);
                                    if (!userNames.Contains(receiveUsername.ToLower()))
                                        missingUsers.Add(receiveUsername);

                                    // Skip parsing further if users not found
                                    if (missingUsers.Count > 0) continue;

                                    if (!decimal.TryParse(pointText.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out decimal pointValue))
                                        return BadRequest($"Invalid point format at row {row}: '{pointText}'");

                                    var transaction = new Transaction
                                    {
                                        ProposeUsername = proposeUsername,
                                        ReceiveUsername = receiveUsername,
                                        Point = pointValue,
                                        DateTime = ParseDateTimeWithTime(dateText, timeText),
                                        Calendar1 = calendar1,
                                        Calendar2 = calendar2
                                    };

                                    transactions.Add(transaction);

                                    // Update points in-memory
                                    var sender = users.FirstOrDefault(u => u.Name.Equals(proposeUsername, StringComparison.OrdinalIgnoreCase));
                                    if (sender != null)
                                        sender.Point += pointValue;

                                    var receiver = users.FirstOrDefault(u => u.Name.Equals(receiveUsername, StringComparison.OrdinalIgnoreCase));
                                    if (receiver != null)
                                        receiver.Point -= pointValue;
                                }
                                catch (Exception ex)
                                {
                                    return BadRequest($"Lỗi tại dòng {row}/{row + 1}: {ex.Message}");
                                }
                            }

                            // If any unknown users found, abort and notify
                            if (missingUsers.Count > 0)
                            {
                                return BadRequest("Import thất bại. Các user không tồn tại là: " +
                                                  string.Join(", ", missingUsers));
                            }

                            await _carManagerContext.Transactions.AddRangeAsync(transactions);
                            await _carManagerContext.SaveChangesAsync();

                            return Ok($"Import thành công. Đã thêm {transactions.Count} giao dịch.");
                        default:
                            return BadRequest("Bạn chưa nhập đánh dấu trang (Salary - Transaction) ở ô A3");
                    }
                }
            }
        }


        private DateTime ParseDateTimeWithTime(string dateText, string timeText)
        {
            // Normalize time: "18h26" → "18:26"
            string normalizedTime = timeText.Replace("h", ":");

            // Possible datetime formats
            string[] formats =
            {
                "d/M H:mm",
                "d/M HH:mm",
                "d/M/yyyy H:mm",
                "d/M/yyyy HH:mm",
                "d/M H:m",
                "d/M HH:m",
                "d/M/yyyy H:m",
                "d/M/yyyy HH:m"
            };

            // If date has no year → append current year
            if (!dateText.Contains("/"))
            {
                // should never happen, but safety
                dateText = DateTime.Now.ToString("d/M/yyyy");
            }
            else if (dateText.Count(c => c == '/') == 1)
            {
                // d/M → add current year
                dateText = $"{dateText}/{DateTime.Now.Year}";
            }

            string fullDateTime = $"{dateText} {normalizedTime}";

            if (DateTime.TryParseExact(
                fullDateTime,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime result))
            {
                return result;
            }

            // Fallback
            return DateTime.Now;
        }


        [HttpDelete("delete-transactions")]
        public async Task<IActionResult> DeleteTransactionsByDate([FromQuery] string dateText)
        {
            if (string.IsNullOrWhiteSpace(dateText))
                return BadRequest("Missing or invalid date.");

            if (!DateTime.TryParseExact(dateText, new[] { "d/M/yyyy", "dd/MM/yyyy" },
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                return BadRequest("Invalid date format. Use 'd/M/yyyy' (e.g. 1/7/2025).");
            }

            var startOfDay = date.Date;
            var endOfDay = date.Date.AddDays(1);

            var transactionDeletes = await _carManagerContext.Transactions
                .Where(t => t.DateTime >= startOfDay && t.DateTime < endOfDay)
                .ToListAsync();

            if (!transactionDeletes.Any())
            {
                return NotFound("Không có giao dịch nào vào ngày này.");
            }
            var list_user = await _carManagerContext.Users.ToListAsync();
            var userDict = list_user
                        .Where(u => !string.IsNullOrEmpty(u.Name))
                        .GroupBy(u => u.Name.ToLower().Trim()) // Normalize key
                        .ToDictionary(g => g.Key, g => g.First());

            foreach (var trans in transactionDeletes)
            {
                var pName = trans.ProposeUsername?.ToLower().Trim();
                var rName = trans.ReceiveUsername?.ToLower().Trim();

                // 3. Handle Proposer (Undo: give points BACK)
                if (pName != "flashcar" && !string.IsNullOrEmpty(pName) && userDict.TryGetValue(pName, out var pUser))
                {
                    pUser.Point += trans.Point; // Reversed to += to undo a spend
                }

                // 4. Handle Receiver (Undo: take points AWAY)
                if (rName != "flashcar" && !string.IsNullOrEmpty(rName) && userDict.TryGetValue(rName, out var rUser))
                {
                    rUser.Point -= trans.Point; // Reversed to -= to undo a receipt
                }
            }

            _carManagerContext.Transactions.RemoveRange(transactionDeletes);
            await _carManagerContext.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa {transactionDeletes.Count} giao dịch vào ngày {dateText}." });
        }

    }
}