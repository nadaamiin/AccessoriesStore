namespace AccessoriesStore.Api.Services;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, string customerName, string orderNumber, decimal total);
}