using Azure;
using manager_Car.Models;
using manager_Car.Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace manager_Car.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(AdminLoginModel adminLoginModel)
        {
            var token = await _authService.Login(adminLoginModel);
            return Ok(token);
        }

    }
}
