using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Entity;

public partial class SubscriptionPlan
{
    public int PlanId { get; set; }

    public string PlanName { get; set; } = null!;

    public decimal Amount { get; set; }

    public string? Currency { get; set; }

    public string BillingPeriod { get; set; } = null!;

    public int? BillingInterval { get; set; }

    public string? Description { get; set; }

    public string? RazorpayPlanId { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? AdFree { get; set; }

    public int? MaxDevices { get; set; }

    public string? VideoQuality { get; set; }

    public bool? DownloadAllowed { get; set; }

    public virtual ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
}
