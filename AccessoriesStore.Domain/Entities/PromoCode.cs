namespace AccessoriesStore.Domain.Entities;

public class PromoCode
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public bool IsPercentage { get; set; } = true;
    public decimal DiscountValue { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}