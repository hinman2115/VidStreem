using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Entity;

public partial class UserSubscription
{
    public int SubscriptionId { get; set; }

    public int UserId { get; set; }

    public int PlanId { get; set; }

    public string? RazorpayOrderId { get; set; }

    public string? RazorpayPaymentId { get; set; }

    public string? RazorpaySignature { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public virtual SubscriptionPlan Plan { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
