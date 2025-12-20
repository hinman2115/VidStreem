using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VidStreem_Backbone.Entity;

namespace VidStreem_Backbone.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryVC : ControllerBase
    {
        private readonly Db29721Context _context;

        public CategoryVC(Db29721Context context)
        {
            _context = context;
        }

        // GET: api/CategoryVC
        // Get all categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(new
                {
                    message = "Categories retrieved successfully",
                    data = categories,
                    count = categories.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving categories", error = ex.Message });
            }
        }

        // GET: api/CategoryVC/{id}
        // Get category by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategoryById(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                return Ok(new
                {
                    message = "Category retrieved successfully",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving category", error = ex.Message });
            }
        }

        // GET: api/CategoryVC/name/{name}
        // Get category by name
        [HttpGet("name/{name}")]
        public async Task<ActionResult<Category>> GetCategoryByName(string name)
        {
            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());

                if (category == null)
                {
                    return NotFound(new { message = $"Category '{name}' not found" });
                }

                return Ok(new
                {
                    message = "Category retrieved successfully",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving category", error = ex.Message });
            }
        }

        // POST: api/CategoryVC
        // Create new category
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            try
            {
                if (category == null)
                {
                    return BadRequest(new { message = "Category data is required" });
                }

                // Check if category name already exists
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower());

                if (existingCategory != null)
                {
                    return Conflict(new { message = "Category name already exists" });
                }

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetCategoryById),
                    new { id = category.CategoryId },
                    new
                    {
                        message = "Category created successfully",
                        data = category
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating category", error = ex.Message });
            }
        }

        // PUT: api/CategoryVC/{id}
        // Update existing category
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            try
            {
                if (category == null)
                {
                    return BadRequest(new { message = "Category data is required" });
                }

                var existingCategory = await _context.Categories.FindAsync(id);

                if (existingCategory == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                // Check if new name conflicts with another category
                var duplicateCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == category.Name.ToLower()
                                              && c.CategoryId != id);

                if (duplicateCategory != null)
                {
                    return Conflict(new { message = "Category name already exists" });
                }

                // Update properties
                existingCategory.Name = category.Name;

                _context.Entry(existingCategory).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Category updated successfully",
                    data = existingCategory
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await CategoryExists(id))
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }
                throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating category", error = ex.Message });
            }
        }

        // PATCH: api/CategoryVC/{id}
        // Partially update category (e.g., just the name)
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchCategory(int id, [FromBody] Category partialCategory)
        {
            try
            {
                var existingCategory = await _context.Categories.FindAsync(id);

                if (existingCategory == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(partialCategory.Name))
                {
                    // Check for duplicate name
                    var duplicateCategory = await _context.Categories
                        .FirstOrDefaultAsync(c => c.Name.ToLower() == partialCategory.Name.ToLower()
                                                  && c.CategoryId != id);

                    if (duplicateCategory != null)
                    {
                        return Conflict(new { message = "Category name already exists" });
                    }

                    existingCategory.Name = partialCategory.Name;
                }


                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Category updated successfully",
                    data = existingCategory
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating category", error = ex.Message });
            }
        }

        // DELETE: api/CategoryVC/{id}
        // Delete category
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                // Check if category has associated videos
                var hasVideos = await _context.Videos.AnyAsync(v => v.CategoryId == id);

                if (hasVideos)
                {
                    return BadRequest(new
                    {
                        message = "Cannot delete category with associated videos. Please delete or reassign videos first."
                    });
                }

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Category deleted successfully",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting category", error = ex.Message });
            }
        }

        // GET: api/CategoryVC/{id}/videos
        // Get all videos in a category
        [HttpGet("{id}/videos")]
        public async Task<ActionResult> GetCategoryVideos(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                var videos = await _context.Videos
                    .Where(v => v.CategoryId == id)
                    .Select(v => new
                    {
                        v.Id,
                        v.Title,
                        v.Description,
                        v.Duration,
                        v.UploadedOn,
                        ThumbnailPath = $"{Request.Scheme}://{Request.Host}/uploads/thumbnails/{Path.GetFileName(v.ThumbnailPath)}"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    message = "Videos retrieved successfully",
                    category = category.Name,
                    data = videos,
                    count = videos.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving videos", error = ex.Message });
            }
        }

        // GET: api/CategoryVC/count
        // Get total category count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCategoryCount()
        {
            try
            {
                var count = await _context.Categories.CountAsync();

                return Ok(new
                {
                    message = "Category count retrieved successfully",
                    count = count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving count", error = ex.Message });
            }
        }

        // GET: api/CategoryVC/search?q=action
        // Search categories by name or description
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Category>>> SearchCategories([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                {
                    return BadRequest(new { message = "Search query is required" });
                }

                var categories = await _context.Categories
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(new
                {
                    message = "Search completed successfully",
                    query = q,
                    data = categories,
                    count = categories.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching categories", error = ex.Message });
            }
        }

        // Helper method to check if category exists
        private async Task<bool> CategoryExists(int id)
        {
            return await _context.Categories.AnyAsync(e => e.CategoryId == id);
        }
    }
}
