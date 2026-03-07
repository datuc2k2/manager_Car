using manager_Car.Models;
using manager_Car.Service.IService;

namespace manager_Car.Service
{
    public class AuthService : IAuthService
    {
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IJwtTokenGenerator jwtTokenGenerator)
        {
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<string> Login(AdminLoginModel adminLoginModel)
        {
            // Fix username password
            string u = "flashcar.304";//"administrator";
            string p = "flashcar.304";//"administrator";
            bool isValid = adminLoginModel.user_name == u && adminLoginModel.user_password == p;

            if (!isValid)
            {
                return "Đăng nhập thất bại!";
            }

            var token = _jwtTokenGenerator.GenerateToken(adminLoginModel);
            return token;
        }

    }
}
