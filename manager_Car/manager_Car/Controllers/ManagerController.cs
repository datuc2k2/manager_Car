﻿using System.Globalization;
using manager_Car.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;

                    string dateText = "1/7";
                    var users = await _carManagerContext.Users.ToListAsync();
                    var userNames = users.Select(u => u.Name.ToLower().Trim()).ToHashSet();

                    var transactions = new List<Transaction>();
                    var missingUsers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

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
                                dateText = worksheet.Cells[row, 1].Text.Trim();

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
                }
            }
        }


        private DateTime ParseDateTimeWithTime(string dateText, string timeText)
        {
            DateTime dateOnly;
            TimeSpan timeOnly;

            // Parse "1/7" → 1 July
            if (!DateTime.TryParseExact(dateText, "d/M", CultureInfo.InvariantCulture, DateTimeStyles.None, out dateOnly))
                dateOnly = DateTime.Now.Date;

            // Normalize "18h26" or "9:14"
            string normalizedTime = timeText.Replace("h", ":");

            // Combine "1/7" + "18:26"
            string fullDateTime = $"{dateText} {normalizedTime}";
            DateTime finalDateTime;

            if (!DateTime.TryParseExact(fullDateTime, new[] { "d/M H:mm", "d/M HH:mm", "d/M H:m", "d/M HH:m" },
                CultureInfo.InvariantCulture, DateTimeStyles.None, out finalDateTime))
            {
                finalDateTime = DateTime.Now; // fallback
            }

            return finalDateTime;
        }

    }
}
