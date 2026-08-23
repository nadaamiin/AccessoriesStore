using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;
using AccessoriesStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly PromoCodesController _promoCodesController;

    public OrdersController(AppDbContext context, IEmailService emailService, PromoCodesController promoCodesController)
    {
        _context = context;
        _emailService = emailService;
        _promoCodesController = promoCodesController;
    }

    // POST: api/orders
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");

        // Load all requested products in one query
        var productIds = dto.Items.Select(i => i.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        // Validate every product exists, is active, and has enough stock
        foreach (var item in dto.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null)
                return BadRequest($"Product with id {item.ProductId} not found.");
            if (!product.IsActive)
                return BadRequest($"Product '{product.Name}' is not available.");
            if (item.Quantity <= 0)
                return BadRequest($"Invalid quantity for product '{product.Name}'.");
            if (product.StockQuantity < item.Quantity)
                return BadRequest($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}.");
        }

        // Build order — prices come from the DB, never trust client-sent prices
        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            ShippingAddress = dto.ShippingAddress,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        decimal total = 0;
        foreach (var item in dto.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);
            var effectivePrice = (product.IsOnSale && product.SalePrice.HasValue) ? product.SalePrice.Value : product.Price;

            order.OrderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = effectivePrice
            });

            product.StockQuantity -= item.Quantity;
            total += effectivePrice * item.Quantity;
        }

        var shippingSettings = await _context.ShippingSettings.FirstOrDefaultAsync();
        var shippingFee = shippingSettings?.ShippingFee ?? 0;
        var freeShippingThreshold = shippingSettings?.FreeShippingThreshold ?? 0;

        if (freeShippingThreshold > 0 && total >= freeShippingThreshold)
        {
            shippingFee = 0;
        }

        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(dto.PromoCode))
        {
            var promoResult = await _promoCodesController.ValidateInternal(dto.PromoCode, total);
            if (promoResult.Valid)
            {
                discountAmount = promoResult.DiscountAmount;
                order.PromoCode = dto.PromoCode.Trim().ToUpper();
            }
        }

        order.ShippingFee = shippingFee;
        order.DiscountAmount = discountAmount;
        order.TotalAmount = total - discountAmount + shippingFee;

        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = OrderStatus.Pending,
            ChangedAt = DateTime.UtcNow,
            Note = "Order placed."
        });

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var result = await BuildOrderDto(order.Id);

        // Send confirmation email (don't let email failure break the order)
        try
        {
            await _emailService.SendOrderConfirmationAsync(
                order.CustomerEmail, order.CustomerName, order.OrderNumber, order.TotalAmount);
        }
        catch (Exception ex)
        {
            // Log but don't fail the order if email sending has an issue
            Console.WriteLine($"Email send failed: {ex.Message}");
        }

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, result);
    }

    // GET: api/orders/5
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        return Ok(await BuildOrderDto(id));
    }

    private async Task<OrderDto> BuildOrderDto(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Category)
            .Include(o => o.StatusHistory)
            .FirstAsync(o => o.Id == orderId);

        var latestChange = order.StatusHistory
            .OrderByDescending(h => h.ChangedAt)
            .FirstOrDefault();

        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            ShippingAddress = order.ShippingAddress,
            Status = order.Status.ToString(),
            StatusChangedAt = latestChange?.ChangedAt ?? order.CreatedAt,
            TotalAmount = order.TotalAmount,
            ShippingFee = order.ShippingFee,
            DiscountAmount = order.DiscountAmount,
            PromoCode = order.PromoCode,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                CategoryName = oi.Product.Category.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
    }


    // GET: api/orders/track?orderNumber=...&email=...
    [HttpGet("track")]
    public async Task<ActionResult<OrderDto>> TrackOrder([FromQuery] string orderNumber, [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(orderNumber) || string.IsNullOrWhiteSpace(email))
            return BadRequest("Order number and email are required.");

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o =>
                o.OrderNumber == orderNumber &&
                o.CustomerEmail.ToLower() == email.ToLower());

        if (order == null)
            return NotFound("No order found matching that order number and email.");

        return Ok(await BuildOrderDto(order.Id));
    }

    [Authorize]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        order.Status = dto.Status;

        _context.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = dto.Status,
            ChangedAt = DateTime.UtcNow,
            Note = dto.Note
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.Id)
            .ToListAsync();

        var result = new List<OrderDto>();
        foreach (var id in orders)
            result.Add(await BuildOrderDto(id));

        return Ok(result);
    }
}