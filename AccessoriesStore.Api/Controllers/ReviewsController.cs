using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ReviewsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // POST: api/reviews — public, customer submits a review (unapproved by default)
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromForm] CreateReviewDto dto, IFormFile? image)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
        if (!productExists)
            return BadRequest("Invalid ProductId.");

        var review = new Review
        {
            ProductId = dto.ProductId,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        if (image != null && image.Length > 0)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", "reviews");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            review.ImageUrl = $"/uploads/reviews/{fileName}";
        }

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Thanks! Your review has been submitted and will appear once approved." });
    }

    // GET: api/reviews/approved — public, used by storefront (optionally filter by product)
    [HttpGet("approved")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetApprovedReviews([FromQuery] int? productId)
    {
        var query = _context.Reviews
            .Include(r => r.Product)
            .Where(r => r.IsApproved);

        if (productId.HasValue)
            query = query.Where(r => r.ProductId == productId.Value);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                ProductImageUrl = r.Product.ImageUrl,
                CustomerName = r.CustomerName,
                CustomerEmail = r.CustomerEmail,
                Rating = r.Rating,
                Comment = r.Comment,
                ImageUrl = r.ImageUrl,
                IsApproved = r.IsApproved,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // GET: api/reviews — admin only, all reviews (pending + approved)
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAllReviews()
    {
        var reviews = await _context.Reviews
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                ProductImageUrl = r.Product.ImageUrl,
                CustomerName = r.CustomerName,
                CustomerEmail = r.CustomerEmail,
                Rating = r.Rating,
                Comment = r.Comment,
                ImageUrl = r.ImageUrl,
                IsApproved = r.IsApproved,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // PUT: api/reviews/5/approve — admin only
    [Authorize]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound();

        review.IsApproved = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/reviews/5 — admin only (reject/remove)
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}