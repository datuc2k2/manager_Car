using manager_Car.Models;
using Microsoft.AspNetCore.Identity;

namespace manager_Car.Service.IService
{
    public interface IAuthService
    {
        Task<string> Login(AdminLoginModel loginRequestDto);
    }
}
