using Microsoft.AspNetCore.Mvc;

namespace manager_Car.Controllers
{
    public class ManageController : Controller
    {
        public IActionResult AccountList()
        {
            return View();
        }
    }
}
