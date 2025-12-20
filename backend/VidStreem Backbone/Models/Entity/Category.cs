using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Models.Entity;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string? PImage { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
