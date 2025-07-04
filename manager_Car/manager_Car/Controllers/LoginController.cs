using manager_Car.Models;
using Microsoft.AspNetCore.Mvc;

namespace manager_Car.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Login(AdminLoginModel model)
        {
            if (ModelState.IsValid)
            {
                // Kiểm tra thông tin đăng nhập
                if (model.user_name == "administrator" && model.user_password == "administrator")
                {
                    var token = "sample-token-" + System.Guid.NewGuid().ToString();

                    // Lưu token vào cookie
                    Response.Cookies.Append("AuthToken", token, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.Now.AddHours(1)
                    });

                    return Json(new { success = true, token = token, redirectUrl = Url.Action("Index", "Home") });
                }

                else
                {
                    // Trả về lỗi
                    return Json(new { success = false, message = "Tên đăng nhập hoặc mật khẩu không đúng!" });
                }
            }
            return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });
        }
    }
}
