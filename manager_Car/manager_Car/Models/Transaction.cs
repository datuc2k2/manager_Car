using System;
using System.Collections.Generic;

namespace manager_Car.Models;

public partial class Transaction
{
    public int Id { get; set; }

    public string ProposeUsername { get; set; } = null!;

    public string ReceiveUsername { get; set; } = null!;

    public decimal Point { get; set; }

    public DateTime DateTime { get; set; }

    public string? Calendar1 { get; set; }

    public string? Calendar2 { get; set; }
}
