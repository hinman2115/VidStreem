using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace VidStreem_Backbone.Db;

public partial class VideoDbContext : DbContext
{
    public VideoDbContext()
    {
    }

    public VideoDbContext(DbContextOptions<VideoDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Video> Videos { get; set; }

    public virtual DbSet<WatchHistory> WatchHistories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=NAMAN_KHATRI\\SQLEXPRESS;Initial Catalog=VideoDb;Integrated Security=True;Encrypt=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__D54EE9B4ED394778");

            entity.HasIndex(e => e.Name, "UQ__Categori__72E12F1BD175FC5B").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F141FAD8D");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E616459F28968").IsUnique();

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

        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Videos__3214EC07D71C131E");

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
            entity.HasKey(e => e.Id).HasName("PK__WatchHis__3214EC0764916BA2");

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
