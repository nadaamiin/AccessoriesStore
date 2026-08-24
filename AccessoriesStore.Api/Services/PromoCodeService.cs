using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AccessoriesStore.Api.Services;

public class PromoCodeService : IPromoCodeService
{
    private readonly AppDbContext _context;

    public PromoCodeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ValidatePromoCodeResultDto> ValidateAsync(string? codeInput, decimal subtotal)
    {
        if (string.IsNullOrWhiteSpace(codeInput))
            return new ValidatePromoCodeResultDto { Valid = false, DiscountAmount = 0, Message = "Enter a code." };

        var code = await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == codeInput.Trim().ToUpper());

        if (code == null || !code.IsActive)
            return new ValidatePromoCodeResultDto { Valid = false, DiscountAmount = 0, Message = "Invalid promo code." };

        if (code.ExpiresAt.HasValue && code.ExpiresAt.Value < DateTime.UtcNow)
            return new ValidatePromoCodeResultDto { Valid = false, DiscountAmount = 0, Message = "This code has expired." };

        var discount = code.IsPercentage
            ? Math.Round(subtotal * (code.DiscountValue / 100m), 2)
            : Math.Min(code.DiscountValue, subtotal);

        return new ValidatePromoCodeResultDto
        {
            Valid = true,
            DiscountAmount = discount,
            Message = code.IsPercentage ? $"{code.DiscountValue}% off applied!" : $"LE {code.DiscountValue} off applied!"
        };
    }
}