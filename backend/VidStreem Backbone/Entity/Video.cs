using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Entity;

public partial class Video
{
    public int Id { get; set; }

    public string ContentType { get; set; } = null!;

    public DateTime UploadedOn { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string FilePath { get; set; } = null!;

    public string? ThumbnailPath { get; set; }

    public int CategoryId { get; set; }

    public long? Duration { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<WatchHistory> WatchHistories { get; set; } = new List<WatchHistory>();
}
