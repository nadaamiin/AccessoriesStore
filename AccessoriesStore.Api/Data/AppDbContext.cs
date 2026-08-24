using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Data;

public class AppDbContext : IdentityDbContext<AdminUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();

    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ShippingSettings> ShippingSettings => Set<ShippingSettings>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // must call base for Identity tables

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderNumber)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Product>()
            .Property(p => p.SalePrice)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.ShippingFee)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<ShippingSettings>()
            .Property(s => s.ShippingFee)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<ShippingSettings>()
            .Property(s => s.FreeShippingThreshold)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<PromoCode>()
            .Property(p => p.DiscountValue)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.DiscountAmount)
            .HasColumnType("decimal(18,2)");
    }
}