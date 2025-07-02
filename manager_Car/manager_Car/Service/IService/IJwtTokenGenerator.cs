using manager_Car.Models;

namespace manager_Car.Service.IService
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(AdminLoginModel adminLoginModel);
    }
}
