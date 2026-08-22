using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnnouncementController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/announcement — public, used by the storefront
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var announcement = await _context.Announcements.FirstOrDefaultAsync();
        if (announcement == null || !announcement.IsActive)
            return Ok(new { isActive = false, message = "" });

        return Ok(new { isActive = true, message = announcement.Message });
    }

    // PUT: api/announcement — admin only
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateAnnouncementRequest request)
    {
        var announcement = await _context.Announcements.FirstOrDefaultAsync();
        if (announcement == null)
        {
            announcement = new Announcement();
            _context.Announcements.Add(announcement);
        }

        announcement.Message = request.Message;
        announcement.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return Ok();
    }
}

public class UpdateAnnouncementRequest
{
    public string Message { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}