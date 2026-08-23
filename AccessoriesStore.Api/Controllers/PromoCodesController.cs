using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromoCodesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PromoCodesController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet]
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PromoCodeDto>>> GetAll()
    {
        var codes = await _context.PromoCodes
            .OrderByDescending(p => p.Id)
            .Select(p => new PromoCodeDto
            {
                Id = p.Id,
                Code = p.Code,
                OwnerName = p.OwnerName,
                IsPercentage = p.IsPercentage,
                DiscountValue = p.DiscountValue,
                IsActive = p.IsActive,
                ExpiresAt = p.ExpiresAt
            })
            .ToListAsync();

        return Ok(codes);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PromoCodeDto>> Create(CreatePromoCodeDto dto)
    {
        var code = new PromoCode
        {
            Code = dto.Code.Trim().ToUpper(),
            OwnerName = dto.OwnerName,
            IsPercentage = dto.IsPercentage,
            DiscountValue = dto.DiscountValue,
            IsActive = dto.IsActive,
            ExpiresAt = dto.ExpiresAt
        };

        _context.PromoCodes.Add(code);
        await _context.SaveChangesAsync();

        return Ok(new PromoCodeDto
        {
            Id = code.Id,
            Code = code.Code,
            OwnerName = code.OwnerName,
            IsPercentage = code.IsPercentage,
            DiscountValue = code.DiscountValue,
            IsActive = code.IsActive,
            ExpiresAt = code.ExpiresAt
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreatePromoCodeDto dto)
    {
        var code = await _context.PromoCodes.FindAsync(id);
        if (code == null) return NotFound();

        code.Code = dto.Code.Trim().ToUpper();
        code.IsPercentage = dto.IsPercentage;
        code.DiscountValue = dto.DiscountValue;
        code.IsActive = dto.IsActive;
        code.ExpiresAt = dto.ExpiresAt;
        code.OwnerName = dto.OwnerName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var code = await _context.PromoCodes.FindAsync(id);
        if (code == null) return NotFound();

        _context.PromoCodes.Remove(code);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/promocodes/validate — public, used by storefront checkout
    [HttpPost("validate")]
    public async Task<ActionResult<ValidatePromoCodeResultDto>> Validate(ValidatePromoCodeDto dto)
    {
        var result = await ValidateInternal(dto.Code, dto.Subtotal);
        return Ok(result);
    }

    internal async Task<ValidatePromoCodeResultDto> ValidateInternal(string? codeInput, decimal subtotal)
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