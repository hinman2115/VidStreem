using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using System.Security.Claims;
using VidStreem_Backbone.Entity;

namespace VidStreemBackbone.Controllers
{
    [Route("api/subscription")]
    [ApiController]
    public class SubscriptionController : ControllerBase
    {
        private readonly Db29721Context _context;
        private readonly string _keyId;
        private readonly string _keySecret;
        private readonly ILogger<SubscriptionController> _logger;


        public SubscriptionController(
        Db29721Context context,
        IConfiguration configuration,
        ILogger<SubscriptionController> logger)
        {
            _context = context;
            _keyId = configuration["Razorpay:KeyId"]!;
            _keySecret = configuration["Razorpay:KeySecret"]!;
            _logger = logger;
        }

        // DTOs for order-based flow
        public class CreatePaymentRequest
        {
            public int PlanId { get; set; }
        }

        public class VerifyPaymentRequest
        {
            public string RazorpayOrderId { get; set; } = "";
            public string RazorpayPaymentId { get; set; } = "";
            public string RazorpaySignature { get; set; } = "";
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetAllPlans()
        {
            try
            {
                var plans = await _context.SubscriptionPlans
                    .Where(p => p.IsActive == true)
                    .OrderBy(p => p.Amount)
                    .ToListAsync();

                return Ok(new { success = true, data = plans });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching plans: {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "Error fetching plans" });
            }
        }

        // Create a Razorpay Order for a DB-backed plan (no Razorpay subscription)
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder(CreatePaymentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request" });

            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { success = false, message = "Invalid user" });

                // Prevent duplicate active subs
                var hasActive = await _context.UserSubscriptions
                    .AsNoTracking()
                    .AnyAsync(s => s.UserId == userId &&
                                   s.Status == "active" &&
                                   (s.EndDate == null || s.EndDate >= DateTime.UtcNow));

                if (hasActive)
                    return BadRequest(new { success = false, message = "User already has an active subscription" });

                // Use plan only from DB
                var plan = await _context.SubscriptionPlans
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PlanId == request.PlanId && p.IsActive == true);

                if (plan == null)
                    return NotFound(new { success = false, message = "Plan not found" });

                var currency = string.IsNullOrWhiteSpace(plan.Currency) ? "INR" : plan.Currency!.ToUpperInvariant();
                var amountPaise = (int)(plan.Amount * 100);

                var client = new RazorpayClient(_keyId, _keySecret);

                // Create an order for one-time payment
                var orderOptions = new Dictionary<string, object>
                {
                    { "amount", amountPaise },
                    { "currency", currency },
                    { "receipt", $"plan_{plan.PlanId}_{Guid.NewGuid():N}" },
                    { "payment_capture", 1 }
                };
                var order = client.Order.Create(orderOptions);

                // Idempotency: if there's a pending record for this plan without payment, reuse it; else create new
                var existingPending = await _context.UserSubscriptions.FirstOrDefaultAsync(s =>
                    s.UserId == userId &&
                    s.PlanId == plan.PlanId &&
                    s.Status == "pending" &&
                    s.RazorpayOrderId != null &&
                    s.RazorpayPaymentId == null);

                if (existingPending == null)
                {
                    var pending = new UserSubscription
                    {
                        UserId = userId,
                        PlanId = plan.PlanId,
                        Status = "pending",
                        StartDate = null,
                        EndDate = null,
                        RazorpayOrderId = order["id"].ToString(),
                        RazorpayPaymentId = null,
                        RazorpaySignature = null
                    };
                    _context.UserSubscriptions.Add(pending);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Update to the latest order id if desired, else keep older
                    existingPending.RazorpayOrderId = order["id"].ToString();
                    await _context.SaveChangesAsync();
                }

                var data = new
                {
                    orderId = order["id"].ToString(),
                    amount = plan.Amount,
                    currency,
                    planId = plan.PlanId,
                    planName = plan.PlanName,
                    keyId = _keyId
                };

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error creating order: {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "Failed to create order" });
            }
        }

        // Verify the one-time payment, then activate by StartDate/EndDate only
        [Authorize]
        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { success = false, message = "Invalid user" });

                if (string.IsNullOrWhiteSpace(request.RazorpayOrderId) ||
                    string.IsNullOrWhiteSpace(request.RazorpayPaymentId) ||
                    string.IsNullOrWhiteSpace(request.RazorpaySignature))
                {
                    return BadRequest(new { success = false, message = "Missing payment verification fields" });
                }

                var attributes = new Dictionary<string, string>
                {
                    { "razorpay_order_id", request.RazorpayOrderId },
                    { "razorpay_payment_id", request.RazorpayPaymentId },
                    { "razorpay_signature", request.RazorpaySignature }
                };

                try
                {
                    Utils.verifyPaymentSignature(attributes);
                }
                catch (Razorpay.Api.Errors.SignatureVerificationError)
                {
                    return BadRequest(new { success = false, message = "Invalid payment signature" });
                }

                var sub = await _context.UserSubscriptions.FirstOrDefaultAsync(s =>
                    s.UserId == userId &&
                    s.RazorpayOrderId == request.RazorpayOrderId &&
                    s.Status == "pending");

                if (sub == null)
                    return NotFound(new { success = false, message = "Pending subscription not found" });

                // Compute window: 28 days from today
                DateTime today = DateTime.Today;
                DateTime endDate = today.AddDays(28);

                sub.Status = "active";
                sub.StartDate = today;
                sub.EndDate = endDate;
                sub.RazorpayPaymentId = request.RazorpayPaymentId;
                sub.RazorpaySignature = request.RazorpaySignature;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Subscription activated",
                    data = new { startDate = today.ToString("yyyy-MM-dd"), endDate = endDate.ToString("yyyy-MM-dd") }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error verifying payment: {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "Failed to verify payment" });
            }
        }

        // Access check relies only on EndDate
        [Authorize]
        [HttpGet("check-access")]
        public async Task<IActionResult> CheckSubscriptionAccess()
        {
            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { success = false, message = "Invalid user" });

                var now = DateTime.UtcNow;
                var hasAccess = await _context.UserSubscriptions.AnyAsync(s =>
                    s.UserId == userId &&
                    s.Status == "active" &&
                    s.StartDate != null &&
                    s.EndDate != null &&
                    s.EndDate >= now);

                return Ok(new { success = true, hasAccess });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error checking access: {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "Error checking access" });
            }
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out userId) && userId > 0;
        }
    }
}
