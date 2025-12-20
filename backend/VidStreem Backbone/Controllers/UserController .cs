using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VidStreem_Backbone.Db;
using VidStreem_Backbone.Entity;
using VidStreem_Backbone.Models;

namespace VidStreem_Backbone.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly Db29721Context _context;
        private readonly IConfiguration _configuration;

        public UserController(Db29721Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpPost("google-login")]
        public async Task<IActionResult> Googlelogin([FromBody] GoogleLoginRequest request)
        {
            if (request == null) { 
            
            return BadRequest("Invalid request.");
            }
            try { 

                var payload = await GoogleJsonWebSignature.ValidateAsync(
                    request.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings {

                        Audience = new[] { _configuration["Google:ClientId"] }
                    });
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user == null)
                {
                    user = new Entity.User
                    {
                        Name = payload.Name,
                        Email = payload.Email,
                        Role = "User",
                        Phone = null,
                        Password = null,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    var token = GenerateJwtToken(user.UserId, user.Role, user.Name);

                    return Ok(new
                    {
                        Message = "Google login successful",
                        Token = token,
                        UserId = user.UserId,
                        Role = user.Role,
                        Name = user.Name
                    });

                }
                else {
                    var token = GenerateJwtToken(user.UserId, user.Role, user.Name);

                    return Ok(new
                    {
                        Message = "Google login successful",
                        Token = token,
                        UserId = user.UserId,
                        Role = user.Role,
                        Name = user.Name
                    });

                }

            } catch (Exception e) {
            
                return BadRequest("Error processing request: " + e.Message);

            }

            return BadRequest("Something went wrong.");


        }



        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterViewModel user)
        {
            if (user == null)
            {
                return BadRequest("Invalid user data.");
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                return Conflict("A user with this email already exists.");
            }


            // Hash the password
            var passwordHasher = new PasswordHasher<RegisterViewModel>();
            var passwordHash = passwordHasher.HashPassword(user, user.Password);

            var newUser = new Entity.User
            {
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                Password = passwordHash, // Store the hashed password
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully!", userId = newUser.UserId });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users
                .Where(u => u.Email == model.Email)
                .Select(u => new { u.UserId, u.Password, u.Role, u.Name })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            // Verify password
            var passwordHasher = new PasswordHasher<LoginViewModel>();
            var result = passwordHasher.VerifyHashedPassword(model, user.Password, model.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid email or password");
            }

            // Generate JWT token
            var token = GenerateJwtToken(user.UserId, user.Role, user.Name);

            return Ok(new
            {
                Message = "Login successful",
                Token = token,
                UserId = user.UserId,
                Role = user.Role,
                Name = user.Name
            });
        }

        private string GenerateJwtToken(int userId, string role, string name)
        {
            var keyString = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(keyString) || Encoding.UTF8.GetBytes(keyString).Length < 32)
            {
                throw new ArgumentException("JWT key must be at least 32 bytes (256 bits) for HS256 algorithm.");
            }

            var claims = new[]
            {
     new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
        new Claim(ClaimTypes.Name, name),
        new Claim(ClaimTypes.Role, role ?? "User"),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["Jwt:ExpireHours"])),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        // Optional: Get user profile
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            var user = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new
                {
                    u.UserId,
                    u.Name,
                    u.Email,
                    u.Phone,
                    u.Role,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }


        [HttpGet("plans")]
        public async Task<IActionResult> GetAllPlans()
        {
            try
            {
                var plans = await _context.SubscriptionPlans
                    .Where(p => p.IsActive == true) // FIX: Explicit bool comparison
                    .OrderBy(p => p.Amount)
                    .ToListAsync();

                return Ok(new { Success = true, Data = plans });
            }
            catch (Exception ex)
            {
                //_logger.LogError($"Error fetching plans: {ex.Message}");
                return StatusCode(500, new { Success = false, Message = "Error fetching plans" });
            }
        }

        [HttpGet("all-with-subscriptions")]
        public async Task<IActionResult> GetAllUsersWithSubscriptions()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.UserSubscriptions)
                        .ThenInclude(us => us.Plan)
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new
                    {
                        u.UserId,
                        u.Name,
                        u.Email,
                        u.Phone,
                        u.Role,
                        JoiningDate = u.CreatedAt,
                        AccountAgeDays = EF.Functions.DateDiffDay(u.CreatedAt, DateTime.UtcNow),
                        TotalSubscriptions = u.UserSubscriptions.Count,
                        ActiveSubscription = u.UserSubscriptions
                            .Where(s => s.StartDate <= DateTime.UtcNow && s.EndDate >= DateTime.UtcNow)
                            .Select(s => new
                            {
                                s.SubscriptionId,
                                PlanName = s.Plan.PlanName,
                                s.StartDate,
                                s.EndDate,
                                DaysRemaining = EF.Functions.DateDiffDay(DateTime.UtcNow, s.EndDate),
                                s.Plan.Amount
                            })
                            .FirstOrDefault(),
                        SubscriptionHistory = u.UserSubscriptions
                            .OrderByDescending(s => s.StartDate)
                            .Select(s => new
                            {
                                s.SubscriptionId,
                                PlanName = s.Plan.PlanName,
                                s.StartDate,
                                s.EndDate,
                                Status = s.StartDate <= DateTime.UtcNow && s.EndDate >= DateTime.UtcNow ? "Active" :
                                         s.EndDate < DateTime.UtcNow ? "Expired" : "Upcoming",
                                s.Plan.Amount
                            })
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Success = true,
                    Message = "Users with subscriptions retrieved successfully",
                    Count = users.Count,
                    Data = users
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error fetching users with subscriptions",
                    Error = ex.Message
                });
            }
        }

    }
}