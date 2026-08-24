using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;

namespace AccessoriesStore.Tests.Integration.Mocks;

/// <summary>
/// Mock implementation of IEmailService for integration testing.
/// Tracks sent emails without actually calling the Brevo API.
/// </summary>
public class MockEmailService : IEmailService
{
    public List<(string ToEmail, OrderDto Order)> SentEmails { get; } = new();
    public bool ShouldThrow { get; set; } = false;

    public async Task SendOrderConfirmationAsync(string toEmail, OrderDto order)
    {
        if (ShouldThrow)
        {
            throw new Exception("Mock email service configured to throw");
        }

        SentEmails.Add((toEmail, order));
        await Task.CompletedTask;
    }

    public void Reset()
    {
        SentEmails.Clear();
        ShouldThrow = false;
    }
}
