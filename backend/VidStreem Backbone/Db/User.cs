using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Db;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Role { get; set; }

    public string? Password { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<WatchHistory> WatchHistories { get; set; } = new List<WatchHistory>();
}
