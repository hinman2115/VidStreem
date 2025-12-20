namespace VidStreem_Backbone.Models
{
    public class SubscriptionPlan
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; } // Basic, Premium, Family
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string BillingPeriod { get; set; } // monthly, yearly
        public int BillingInterval { get; set; } = 1;
        public string Description { get; set; }
        public string RazorpayPlanId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Features
        public bool AdFree { get; set; }
        public int MaxDevices { get; set; }
        public string VideoQuality { get; set; } // HD, 4K
        public bool DownloadAllowed { get; set; }
    }

    public class UserSubscription
    {
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }
        public int PlanId { get; set; }
        public string RazorpaySubscriptionId { get; set; }
        public string RazorpayPaymentId { get; set; }
        public string RazorpaySignature { get; set; }
        public string Status { get; set; } // active, paused, cancelled, expired
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CancelledAt { get; set; }

        // Navigation properties
        public virtual SubscriptionPlan Plan { get; set; }
    }

}
