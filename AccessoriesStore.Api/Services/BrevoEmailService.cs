using System.Text;
using System.Text.Json;

namespace AccessoriesStore.Api.Services;

public class BrevoEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<BrevoEmailService> _logger;
    private readonly HttpClient _httpClient;

    public BrevoEmailService(IConfiguration config, ILogger<BrevoEmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task SendOrderConfirmationAsync(string toEmail, string customerName, string orderNumber, decimal total)
    {
        var apiKey = _config["Brevo:ApiKey"];
        var fromEmail = _config["Brevo:FromEmail"];
        var fromName = _config["Brevo:FromName"];

        var payload = new
        {
            sender = new { name = fromName, email = fromEmail },
            to = new[] { new { email = toEmail, name = customerName } },
            subject = $"Order Confirmation - {orderNumber}",
            htmlContent = $"<p>Hi {customerName},</p><p>Your order <strong>{orderNumber}</strong> has been placed successfully.</p><p>Total: <strong>{total:C}</strong></p><p>Thank you for shopping with us!</p>"
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Add("api-key", apiKey);
        request.Headers.Add("accept", "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("Brevo failed to send email: {StatusCode} - {Body}", response.StatusCode, body);
        }
    }
}