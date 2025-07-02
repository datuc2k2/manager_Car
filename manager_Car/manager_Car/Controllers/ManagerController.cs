using System.Globalization;
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

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;

                    var transactions = new List<Transaction>();
                    string dateText = "1/7";
                    for (int row = 2; row <= rowCount; row += 2) // Step by 2 rows at a time
                    {
                        try
                        {
                            if (row == 2 && !String.IsNullOrEmpty(worksheet.Cells[row, 1].Text.Trim()))
                            {
                                dateText = worksheet.Cells[row, 1].Text.Trim();
                            }
                            var proposeUsername = worksheet.Cells[row, 3].Text.Trim();
                            var pointText = worksheet.Cells[row, 4].Text.Trim();

                            var timeText = !String.IsNullOrEmpty(worksheet.Cells[row, 5].Text.Trim()) ? worksheet.Cells[row, 5].Text.Trim() : worksheet.Cells[row + 1, 5].Text.Trim();    // "18h26"
                            
                            if (String.IsNullOrEmpty(timeText))
                            {
                                timeText = "00h00";
                            }
                            var calendar1 = worksheet.Cells[row, 6].Text.Trim();

                            var receiveUsername = worksheet.Cells[row + 1, 3].Text.Trim();
                            var calendar2 = worksheet.Cells[row + 1, 6].Text.Trim();

                            decimal pointValue = 0;
                            if (!decimal.TryParse(pointText.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out pointValue))
                            {
                                return BadRequest($"Invalid point format at row {row}: '{pointText}'");
                            }

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
                        }
                        catch (Exception ex)
                        {
                            return BadRequest($"Error parsing rows {row}/{row + 1}: {ex.Message}");
                        }
                    }

                    await _carManagerContext.Transactions.AddRangeAsync(transactions);
                    await _carManagerContext.SaveChangesAsync();

                    return Ok($"Import file thành công.");
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
