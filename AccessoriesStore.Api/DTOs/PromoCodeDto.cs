namespace AccessoriesStore.Api.DTOs;

public class PromoCodeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public bool IsPercentage { get; set; }
    public decimal DiscountValue { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class CreatePromoCodeDto
{
    public string Code { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public bool IsPercentage { get; set; } = true;
    public decimal DiscountValue { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}

public class ValidatePromoCodeDto
{
    public string Code { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
}

public class ValidatePromoCodeResultDto
{
    public bool Valid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}