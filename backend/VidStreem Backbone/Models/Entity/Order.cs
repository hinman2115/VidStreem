using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Models.Entity;

public partial class Order
{
    public int OrderId { get; set; }

    public int UserId { get; set; }

    public int AreaId { get; set; }

    public decimal TotalPrice { get; set; }

    public string? OrderStatus { get; set; }

    public DateTime? OrderDate { get; set; }

    public string? PaymentMethod { get; set; }

    public string? PaymentStatus { get; set; }

    public string? RazorpayOrderId { get; set; }

    public string? RazorpayPaymentId { get; set; }

    public string? RazorpaySignature { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? ReceiptNumber { get; set; }

    public virtual Area Area { get; set; } = null!;

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual User User { get; set; } = null!;
}
