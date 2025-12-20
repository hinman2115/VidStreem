using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Entity;

public partial class Category
{
    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Video> Videos { get; set; } = new List<Video>();
}
