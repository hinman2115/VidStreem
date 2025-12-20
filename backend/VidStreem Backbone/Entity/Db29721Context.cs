using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace VidStreem_Backbone.Entity;

public partial class Db29721Context : DbContext
{
    public Db29721Context()
    {
    }

    public Db29721Context(DbContextOptions<Db29721Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<PaymentHistory> PaymentHistories { get; set; }

    public virtual DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserSubscription> UserSubscriptions { get; set; }

    public virtual DbSet<Video> Videos { get; set; }

    public virtual DbSet<WatchHistory> WatchHistories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=db29721.public.databaseasp.net,1433;Initial Catalog=db29721;Persist Security Info=True;User ID=db29721;Password=5Za#-g9XN+o6;Encrypt=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__D54EE9B420EF3F7E");

            entity.HasIndex(e => e.Name, "UQ__Categori__72E12F1B3E98AC7F").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<PaymentHistory>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__PaymentH__9B556A3848F3D910");

            entity.ToTable("PaymentHistory");

            entity.HasIndex(e => e.RazorpayPaymentId, "IX_PaymentHistory_RazorpayPaymentId");

            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("INR");
            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.RazorpayOrderId).HasMaxLength(100);
            entity.Property(e => e.RazorpayPaymentId).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.User).WithMany(p => p.PaymentHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PaymentHistory_Users");
        });

        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Subscrip__755C22B78A5AF38E");

            entity.Property(e => e.AdFree).HasDefaultValue(false);
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.BillingInterval).HasDefaultValue(1);
            entity.Property(e => e.BillingPeriod).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("INR");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DownloadAllowed).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MaxDevices).HasDefaultValue(1);
            entity.Property(e => e.PlanName).HasMaxLength(100);
            entity.Property(e => e.RazorpayPlanId).HasMaxLength(100);
            entity.Property(e => e.VideoQuality).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F8A014899");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E6164F889EC92").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .HasDefaultValue("customer")
                .HasColumnName("role");
        });

        modelBuilder.Entity<UserSubscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId);

            entity.HasIndex(e => e.RazorpayOrderId, "IX_UserSubscriptions_Order");

            entity.HasIndex(e => new { e.UserId, e.Status }, "IX_UserSubscriptions_User_Status");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.RazorpayOrderId).HasMaxLength(100);
            entity.Property(e => e.RazorpayPaymentId).HasMaxLength(100);
            entity.Property(e => e.RazorpaySignature).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Plan).WithMany(p => p.UserSubscriptions)
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserSubscriptions_Plans");

            entity.HasOne(d => d.User).WithMany(p => p.UserSubscriptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserSubscriptions_Users");
        });

        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Videos__3214EC077CAD0334");

            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.FilePath).HasMaxLength(500);
            entity.Property(e => e.ThumbnailPath).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UploadedOn)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Category).WithMany(p => p.Videos)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Videos_Categories");
        });

        modelBuilder.Entity<WatchHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__WatchHis__3214EC07C456FDB6");

            entity.ToTable("WatchHistory", tb => tb.HasTrigger("TR_WatchHistory_MarkCompleted"));

            entity.HasIndex(e => e.IsCompleted, "IX_WatchHistory_IsCompleted").HasFilter("([IsCompleted]=(0))");

            entity.HasIndex(e => new { e.UserId, e.LastWatchedTime }, "IX_WatchHistory_User_LastWatched").IsDescending(false, true);

            entity.HasIndex(e => e.VideoId, "IX_WatchHistory_Video");

            entity.HasIndex(e => new { e.UserId, e.VideoId }, "UQ_WatchHistory_User_Video").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeviceType).HasMaxLength(50);
            entity.Property(e => e.LastWatchedTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PercentageWatched).HasComputedColumnSql("(case when [Duration]>(0) then (CONVERT([float],[LastPosition])/[Duration])*(100) else (0) end)", true);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.WatchCount).HasDefaultValue(1);

            entity.HasOne(d => d.User).WithMany(p => p.WatchHistories)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_WatchHistory_Users");

            entity.HasOne(d => d.Video).WithMany(p => p.WatchHistories)
                .HasForeignKey(d => d.VideoId)
                .HasConstraintName("FK_WatchHistory_Videos");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
