using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;

namespace AccessoriesStore.Tests.Integration.Mocks;

/// <summary>
/// Mock implementation of IPromoCodeService for integration testing.
/// Allows tests to control validation results without database access.
/// </summary>
public class MockPromoCodeService : IPromoCodeService
{
    private Dictionary<string, ValidatePromoCodeResultDto> _codeResults = new();

    public async Task<ValidatePromoCodeResultDto> ValidateAsync(string? codeInput, decimal subtotal)
    {
        if (string.IsNullOrWhiteSpace(codeInput))
        {
            return new ValidatePromoCodeResultDto
            {
                Valid = false,
                DiscountAmount = 0,
                Message = "Enter a code."
            };
        }

        var code = codeInput.Trim().ToUpper();
        if (_codeResults.TryGetValue(code, out var result))
        {
            return await Task.FromResult(result);
        }

        // Default: return invalid if not configured
        return await Task.FromResult(new ValidatePromoCodeResultDto
        {
            Valid = false,
            DiscountAmount = 0,
            Message = "Code not configured in mock."
        });
    }

    /// <summary>
    /// Configure a specific promo code to return a given result.
    /// </summary>
    public void SetCodeResult(string code, bool valid, decimal discountAmount, string message)
    {
        _codeResults[code.ToUpper()] = new ValidatePromoCodeResultDto
        {
            Valid = valid,
            DiscountAmount = discountAmount,
            Message = message
        };
    }

    public void Reset()
    {
        _codeResults.Clear();
    }
}
