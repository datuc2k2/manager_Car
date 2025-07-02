using Microsoft.AspNetCore.Mvc;

namespace manager_Car.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
