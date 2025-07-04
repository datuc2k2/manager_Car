using System.ComponentModel.DataAnnotations;

namespace manager_Car.Models
{
    public class AdminLoginModel
    {
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
        public string user_name { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        [DataType(DataType.Password)]
        public string user_password { get; set; }
    }
}
