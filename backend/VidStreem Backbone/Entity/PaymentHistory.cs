using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Entity;

public partial class PaymentHistory
{
    public int PaymentId { get; set; }

    public int UserId { get; set; }

    public int? SubscriptionId { get; set; }

    public string RazorpayPaymentId { get; set; } = null!;

    public string? RazorpayOrderId { get; set; }

    public decimal Amount { get; set; }

    public string? Currency { get; set; }

    public string Status { get; set; } = null!;

    public string? PaymentMethod { get; set; }

    public DateTime? PaymentDate { get; set; }

    public virtual User User { get; set; } = null!;
}
