using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;
    private const int LowStockThreshold = 5;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var totalProducts = await _context.Products.CountAsync();
        var activeProducts = await _context.Products.CountAsync(p => p.IsActive);
        var lowStockCount = await _context.Products.CountAsync(p => p.IsActive && p.StockQuantity <= LowStockThreshold);

        var totalOrders = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        var ordersByStatus = await _context.Orders
            .GroupBy(o => o.Status)
            .Select(g => new StatusCountDto { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        // Revenue for the last 14 days, including days with zero orders
        var since = DateTime.UtcNow.Date.AddDays(-13);
        var rawRevenue = await _context.Orders
            .Where(o => o.CreatedAt >= since && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
            .ToListAsync();

        var revenueByDay = new List<DailyRevenueDto>();
        for (var d = since; d <= DateTime.UtcNow.Date; d = d.AddDays(1))
        {
            var match = rawRevenue.FirstOrDefault(r => r.Date == d);
            revenueByDay.Add(new DailyRevenueDto
            {
                Date = d.ToString("MMM dd"),
                Revenue = match?.Revenue ?? 0
            });
        }

        return Ok(new DashboardStatsDto
        {
            TotalProducts = totalProducts,
            ActiveProducts = activeProducts,
            LowStockCount = lowStockCount,
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            TotalRevenue = totalRevenue,
            OrdersByStatus = ordersByStatus,
            RevenueLast14Days = revenueByDay
        });
    }
}