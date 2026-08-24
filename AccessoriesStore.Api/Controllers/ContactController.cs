using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/contact — public
    [HttpPost]
    public async Task<IActionResult> Create(CreateContactMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest("Name, email, and message are required.");

        var message = new ContactMessage
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Message = dto.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Thanks for reaching out! We'll get back to you soon." });
    }

    // GET: api/contact — admin only
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetAll()
    {
        var messages = await _context.ContactMessages
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new ContactMessageDto
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                Message = m.Message,
                Status = m.Status.ToString(),
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return Ok(messages);
    }

    [Authorize]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateContactMessageStatusDto dto)
    {
        var message = await _context.ContactMessages.FindAsync(id);
        if (message == null) return NotFound();

        if (!Enum.TryParse<ContactMessageStatus>(dto.Status, out var status))
            return BadRequest("Invalid status.");

        message.Status = status;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}