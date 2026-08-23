using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShippingController : ControllerBase
{
    private readonly AppDbContext _context;

    public ShippingController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/shipping — public, used by storefront
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await _context.ShippingSettings.FirstOrDefaultAsync();
        if (settings == null)
            return Ok(new { shippingFee = 0m, freeShippingThreshold = 0m });

        return Ok(new { shippingFee = settings.ShippingFee, freeShippingThreshold = settings.FreeShippingThreshold });
    }

    // PUT: api/shipping — admin only
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateShippingRequest request)
    {
        var settings = await _context.ShippingSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new ShippingSettings();
            _context.ShippingSettings.Add(settings);
        }

        settings.ShippingFee = request.ShippingFee;
        settings.FreeShippingThreshold = request.FreeShippingThreshold;

        await _context.SaveChangesAsync();
        return Ok();
    }
}

public class UpdateShippingRequest
{
    public decimal ShippingFee { get; set; }
    public decimal FreeShippingThreshold { get; set; }
}