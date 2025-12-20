using System;
using Microsoft.AspNetCore.Http;

namespace VidStreem_Backbone.Models
{
    // Used for video uploads
    public class VideoDto
    {
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public int CategoryId { get; set; } // Added for category association

        public long? Duration { get; set; }

        public IFormFile? FilePath { get; set; } = null!;   // Uploaded video file

        public IFormFile? ThumbnailPath { get; set; }       // Uploaded thumbnail file

        public string ContentType { get; set; } = null!;   // e.g., video/mp4
    }

    // Used for returning video info via GET APIs
    public class VideoInfoDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public int CategoryId { get; set; }                 // Include category

        public string ContentType { get; set; } = null!;

        public DateTime? UploadedOn { get; set; }

        public string VideoUrl { get; set; } = null!;

        public string? ThumbnailUrl { get; set; }

        public long Size { get; set; }                     // File size in bytes

        public long? Duration { get; set; }               // Video duration in seconds
    }

    // DTO for updating WatchHistory
    public class WatchHistoryDto
    {
        public int UserId { get; set; }

        public int VideoId { get; set; }

        public long LastPosition { get; set; }            // Last watched position in seconds

        public long? Duration { get; set; }               // Total video duration in seconds

        public string? DeviceType { get; set; }           // e.g., Mobile, Web
    }
}
