namespace AccessoriesStore.Domain.Entities;

public class Announcement
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsActive { get; set; } = false;
}