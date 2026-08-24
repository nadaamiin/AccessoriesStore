using AccessoriesStore.Api.DTOs;

namespace AccessoriesStore.Api.Services;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, OrderDto order);
}