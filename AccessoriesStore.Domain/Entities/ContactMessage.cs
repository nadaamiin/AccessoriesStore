namespace AccessoriesStore.Domain.Entities;

public enum ContactMessageStatus
{
    New,
    Read,
    Replied
}

public class ContactMessage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ContactMessageStatus Status { get; set; } = ContactMessageStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}