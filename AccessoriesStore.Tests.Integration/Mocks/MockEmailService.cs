using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;

namespace AccessoriesStore.Tests.Integration.Mocks;

public class MockEmailService : IEmailService
{
    public List<(string ToEmail, OrderDto Order)> SentEmails { get; } = [];
    public bool ShouldThrow { get; set; }

    public Task SendOrderConfirmationAsync(string toEmail, OrderDto order)
    {
        if (ShouldThrow)
            throw new InvalidOperationException("Mock email service configured to throw");

        SentEmails.Add((toEmail, order));
        return Task.CompletedTask;
    }

    public void Reset()
    {
        SentEmails.Clear();
        ShouldThrow = false;
    }
}
