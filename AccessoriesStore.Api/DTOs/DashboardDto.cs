namespace AccessoriesStore.Api.DTOs;

public class DashboardStatsDto
{
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int LowStockCount { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<StatusCountDto> OrdersByStatus { get; set; } = new();
    public List<DailyRevenueDto> RevenueLast14Days { get; set; } = new();
}

public class StatusCountDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DailyRevenueDto
{
    public string Date { get; set; } = string.Empty; // "MMM dd"
    public decimal Revenue { get; set; }
}