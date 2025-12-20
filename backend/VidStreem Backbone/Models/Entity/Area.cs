using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Models.Entity;

public partial class Area
{
    public int AreaId { get; set; }

    public string? AreaName { get; set; }

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
