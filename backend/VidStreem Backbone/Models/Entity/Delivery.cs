using System;
using System.Collections.Generic;

namespace VidStreem_Backbone.Models.Entity;

public partial class Delivery
{
    public int DeliveryId { get; set; }

    public int OrderId { get; set; }

    public int AreaId { get; set; }

    public string? DeliveryStatus { get; set; }

    public int? AssignedTo { get; set; }

    public DateTime? DeliveryDate { get; set; }

    public string? TrackingNumber { get; set; }

    public virtual Area Area { get; set; } = null!;

    public virtual User? AssignedToNavigation { get; set; }

    public virtual Order Order { get; set; } = null!;
}
