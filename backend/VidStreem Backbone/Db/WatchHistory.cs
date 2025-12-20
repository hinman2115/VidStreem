using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Db;

public partial class WatchHistory
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int VideoId { get; set; }

    public long LastPosition { get; set; }

    public long Duration { get; set; }

    public DateTime LastWatchedTime { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? DeviceType { get; set; }

    public bool IsCompleted { get; set; }

    public int WatchCount { get; set; }

    public double? PercentageWatched { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Video Video { get; set; } = null!;
}
