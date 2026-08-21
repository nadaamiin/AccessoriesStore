using Microsoft.AspNetCore.Identity;

namespace AccessoriesStore.Domain.Entities;

public class AdminUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}