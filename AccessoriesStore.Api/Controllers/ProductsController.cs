using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                SalePrice = p.SalePrice,
                IsOnSale = p.IsOnSale,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                ImageUrls = p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).ToList(),
                Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto { Id = i.Id, Url = i.Url }).ToList(),
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        return Ok(new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            SalePrice = product.SalePrice,
            IsOnSale = product.IsOnSale,
            StockQuantity = product.StockQuantity,
            ImageUrl = product.ImageUrl,
            ImageUrls = product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).ToList(),
            IsActive = product.IsActive,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name
        });
    }

    // GET: api/products/admin/all
    // Admin-only: returns every product, including inactive ones
    [Authorize]
    [HttpGet("admin/all")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProductsForAdmin()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                SalePrice = p.SalePrice,
                IsOnSale = p.IsOnSale,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                ImageUrls = p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).ToList(),
                Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto { Id = i.Id, Url = i.Url }).ToList(),
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return Ok(products);
    }

    // POST: api/products
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            return BadRequest("Invalid CategoryId.");

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            ImageUrl = product.ImageUrl,
            ImageUrls = new List<string>(),
            IsActive = product.IsActive,
            CategoryId = product.CategoryId,
            CategoryName = (await _context.Categories.FindAsync(product.CategoryId))!.Name
        });
    }

    // PUT: api/products/5
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            return BadRequest("Invalid CategoryId.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.SalePrice = dto.SalePrice;
        product.IsOnSale = dto.IsOnSale;
        product.StockQuantity = dto.StockQuantity;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/products/5
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/products/5/image  (legacy single "primary" image)
    [Authorize]
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        product.ImageUrl = $"/uploads/products/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { imageUrl = product.ImageUrl });
    }

    // POST: api/products/5/images  (multi-image gallery)
    [Authorize]
    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadProductImages(int id, List<IFormFile> files)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        if (files == null || files.Count == 0)
            return BadRequest("No files uploaded.");

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsFolder);

        var existingCount = await _context.ProductImages.CountAsync(i => i.ProductId == id);

        foreach (var file in files)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _context.ProductImages.Add(new ProductImage
            {
                ProductId = id,
                Url = $"/uploads/products/{fileName}",
                DisplayOrder = existingCount++
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    // DELETE: api/products/images/5
    [Authorize]
    [HttpDelete("images/{imageId}")]
    public async Task<IActionResult> DeleteProductImage(int imageId)
    {
        var image = await _context.ProductImages.FindAsync(imageId);
        if (image == null)
            return NotFound();

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}