using AccessoriesStore.Api.DTOs;

namespace AccessoriesStore.Api.Services;

public interface IPromoCodeService
{
    Task<ValidatePromoCodeResultDto> ValidateAsync(string? codeInput, decimal subtotal);
}
