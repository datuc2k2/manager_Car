using System;
using System.Collections.Generic;

namespace manager_Car.Models;

public partial class User
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public decimal Point { get; set; }
}
