using Google.Apis.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VidStreem_Backbone.Db;
using VidStreem_Backbone.Entity;
using VidStreem_Backbone.Models;

namespace VidStreem_Backbone.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideohandelApiController : ControllerBase
    {
        private readonly Db29721Context _context;

        public VideohandelApiController(Db29721Context context)
        {
            _context = context;
        }

        // Upload Video 
        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo([FromForm] VideoDto fileDto)
        {
            if (fileDto?.FilePath == null)
                return BadRequest("No file uploaded.");

            if (fileDto.CategoryId <= 0 || !await _context.Categories.AnyAsync(c => c.CategoryId == fileDto.CategoryId))
                return BadRequest("Invalid CategoryId.");

            var file = fileDto.FilePath;

            if (file.Length > 500 * 1024 * 1024)
                return BadRequest("File size exceeds the limit of 500MB.");

            var allowedTypes = new[] { "video/mp4", "video/avi", "video/mkv", "video/webm" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Unsupported file type.");

            try
            {
                var videoUploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
                Directory.CreateDirectory(videoUploadFolder);

                var uniqueVideoFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var videoFilePath = Path.Combine(videoUploadFolder, uniqueVideoFileName);

                using (var stream = new FileStream(videoFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string thumbnailFilePath = null;
                if (fileDto.ThumbnailPath != null)
                {
                    var thumbnailUploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "thumbnails");
                    Directory.CreateDirectory(thumbnailUploadFolder);

                    var uniqueThumbnailFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileDto.ThumbnailPath.FileName)}";
                    thumbnailFilePath = Path.Combine(thumbnailUploadFolder, uniqueThumbnailFileName);

                    using (var stream = new FileStream(thumbnailFilePath, FileMode.Create))
                    {
                        await fileDto.ThumbnailPath.CopyToAsync(stream);
                    }
                }

                var video = new Entity.Video
                {
                    ContentType = file.ContentType,
                    FilePath = videoFilePath,
                    ThumbnailPath = thumbnailFilePath,
                    UploadedOn = DateTime.UtcNow,
                    Title = fileDto.Title,
                    Description = fileDto.Description,
                    CategoryId = fileDto.CategoryId,
                    Duration = fileDto.Duration
                };

                _context.Videos.Add(video);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    video.Id,
                    video.Title,
                    video.CategoryId,
                    video.ContentType,
                    video.Duration,
                    video.UploadedOn,
                    FilePath = video.FilePath,
                    ThumbnailPath = video.ThumbnailPath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading video: {ex.Message}");
            }
        }

        //  Get All Videos 
        [HttpGet]
        public async Task<IActionResult> GetAllVideos()
        {
            var videos = await _context.Videos
                .Select(v => new
                {
                    v.Id,
                    v.Title,
                    v.CategoryId,
                    CategoryName = v.Category != null ? v.Category.Name : null,
                    v.ContentType,
                    v.Duration,
                    v.UploadedOn,
                    VideoUrl = $"{Request.Scheme}://{Request.Host}/uploads/videos/{Path.GetFileName(v.FilePath)}",
                    ThumbnailUrl = v.ThumbnailPath != null ? $"{Request.Scheme}://{Request.Host}/uploads/thumbnails/{Path.GetFileName(v.ThumbnailPath)}" : null
                }).ToListAsync();

            return Ok(videos);
        }

        // Get Video By Id 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVideoById(int id)
        {
            var video = await _context.Videos
                .Where(v => v.Id == id)
                .Select(v => new
                {
                    v.Id,
                    v.Title,
                    v.CategoryId,
                    CategoryName = v.Category != null ? v.Category.Name : null,
                    v.ContentType,
                    v.Duration,
                    v.Description,
                    v.UploadedOn,
                    isPremium = true,
                    VideoUrl = $"{Request.Scheme}://{Request.Host}/uploads/videos/{Path.GetFileName(v.FilePath)}",
                    ThumbnailUrl = v.ThumbnailPath != null ? $"{Request.Scheme}://{Request.Host}/uploads/thumbnails/{Path.GetFileName(v.ThumbnailPath)}" : null
                }).FirstOrDefaultAsync();

            if (video == null)
                return NotFound($"Video with ID {id} not found.");

            return Ok(video);
        }

        // Delete Video By Id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVideo(int id)
        {
            var video = await _context.Videos.FindAsync(id);
            if (video == null)
                return NotFound($"Video with ID {id} not found.");

            try
            {
                if (!string.IsNullOrEmpty(video.FilePath) && System.IO.File.Exists(video.FilePath))
                    System.IO.File.Delete(video.FilePath);

                if (!string.IsNullOrEmpty(video.ThumbnailPath) && System.IO.File.Exists(video.ThumbnailPath))
                    System.IO.File.Delete(video.ThumbnailPath);

                _context.Videos.Remove(video);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Video deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting video: {ex.Message}");
            }
        }


        //edit Video By Id

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateVideo(int id, [FromForm] VideoDto dto)
        {
            var video = await _context.Videos.FindAsync(id);
            if (video == null)
                return NotFound($"Video with ID {id} not found.");

            try
            {
                video.Title = dto.Title ?? video.Title;
                video.Description = dto.Description ?? video.Description;
                video.CategoryId = dto.CategoryId > 0 ? dto.CategoryId : video.CategoryId;
                video.Duration = dto.Duration ?? video.Duration;

                // Update video file
                if (dto.FilePath != null)
                {
                    if (System.IO.File.Exists(video.FilePath))
                        System.IO.File.Delete(video.FilePath);

                    var videoFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
                    var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(dto.FilePath.FileName)}";
                    var newVideoPath = Path.Combine(videoFolder, uniqueName);

                    using (var stream = new FileStream(newVideoPath, FileMode.Create))
                        await dto.FilePath.CopyToAsync(stream);

                    video.FilePath = newVideoPath;
                    video.ContentType = dto.FilePath.ContentType;
                }

                // Update thumbnail
                if (dto.ThumbnailPath != null)
                {
                    if (!string.IsNullOrEmpty(video.ThumbnailPath) && System.IO.File.Exists(video.ThumbnailPath))
                        System.IO.File.Delete(video.ThumbnailPath);

                    var thumbFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "thumbnails");
                    var uniqueThumb = $"{Guid.NewGuid()}{Path.GetExtension(dto.ThumbnailPath.FileName)}";
                    var newThumbPath = Path.Combine(thumbFolder, uniqueThumb);

                    using (var stream = new FileStream(newThumbPath, FileMode.Create))
                        await dto.ThumbnailPath.CopyToAsync(stream);

                    video.ThumbnailPath = newThumbPath;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Video updated successfully.", video });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating video: {ex.Message}");
            }
        }


        //search Videos by Title
        [HttpGet("Search")]
        public async Task<IActionResult> Search(string title)
        {
            var query = _context.Videos.AsQueryable();

            if (!string.IsNullOrEmpty(title))
                query = query.Where(v => v.Title.Contains(title));

            var videos = await query.Select(v => new
            {
                v.Id,
                v.Title,
                v.CategoryId,
                CategoryName = v.Category != null ? v.Category.Name : null,
                v.ContentType,
                v.Duration,
                VideoUrl = $"{Request.Scheme}://{Request.Host}/uploads/videos/{Path.GetFileName(v.FilePath)}",
                ThumbnailUrl = v.ThumbnailPath != null ? $"{Request.Scheme}://{Request.Host}/uploads/thumbnails/{Path.GetFileName(v.ThumbnailPath)}" : null
            }).ToListAsync();

            if (videos.Count == 0) return NotFound("No videos found.");

            return Ok(videos);
        }


        // WatchHistory 
        [HttpPost("watch/update")]
        public async Task<IActionResult> UpdateWatchHistory([FromBody] WatchHistoryDto dto)
        {
            var watch = await _context.WatchHistories
                .FirstOrDefaultAsync(w => w.UserId == dto.UserId && w.VideoId == dto.VideoId);

            if (watch == null)
            {
                watch = new Entity.WatchHistory
                {
                    UserId = dto.UserId,
                    VideoId = dto.VideoId,
                    LastPosition = dto.LastPosition,
                    Duration = dto.Duration ?? 0,
                    DeviceType = dto.DeviceType
                };
                _context.WatchHistories.Add(watch);
            }
            else
            {
                watch.LastPosition = dto.LastPosition;
                watch.Duration = dto.Duration ?? 0;
                watch.LastWatchedTime = DateTime.UtcNow;
                watch.DeviceType = dto.DeviceType;

                if (watch.LastPosition >= watch.Duration * 0.95)  // 95% watched
                    watch.IsCompleted = true;
            }

            await _context.SaveChangesAsync();
            return Ok(watch);
        }

        [HttpGet("watch/{userId}/{videoId}")]
        public async Task<IActionResult> GetWatchHistory(int userId, int videoId)
        {
            var watch = await _context.WatchHistories
                .FirstOrDefaultAsync(w => w.UserId == userId && w.VideoId == videoId);

            if (watch == null) return NotFound();

            return Ok(new
            {
                watch.LastPosition,
                watch.Duration,
                watch.PercentageWatched,
                watch.IsCompleted,
                watch.DeviceType,
                watch.LastWatchedTime
            });
        }

        [HttpGet("watch/user/{userId}")]
        public async Task<IActionResult> GetAllUserWatchHistory(int userId)
        {
            var history = await _context.WatchHistories
                .Where(w => w.UserId == userId)
                .Select(w => new
                {
                    w.VideoId,
                    w.LastPosition,
                    w.Duration,
                    w.PercentageWatched,
                    w.IsCompleted,
                    w.LastWatchedTime
                }).ToListAsync();

            return Ok(history);
        }

        [HttpGet("thumbnails")]
        public async Task<IActionResult> GetHomeThumbnails(int? categoryId = null, int take = 50, int skip = 0)
        {
            var query = _context.Videos.AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(v => v.CategoryId == categoryId.Value);

            var items = await query
                .OrderByDescending(v => v.UploadedOn)
                .Skip(skip)
                .Take(take)
                .Select(v => new
                {
                    v.Id,
                    Title = v.Title,
                    CategoryId = v.CategoryId,
                    CategoryName = v.Category.Name,
                    thumbnailUrl = v.ThumbnailPath != null ? $"{Request.Scheme}://{Request.Host}/uploads/thumbnails/{Path.GetFileName(v.ThumbnailPath)}" : null,
                    v.UploadedOn
                })
                .ToListAsync();

            return Ok(items);
        }

    }
}
