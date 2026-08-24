using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using AccessoriesStore.Api.DTOs;

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

    public async Task SendOrderConfirmationAsync(string toEmail, OrderDto order)
    {
        var apiKey = _config["Brevo:ApiKey"];
        var fromEmail = _config["Brevo:FromEmail"];
        var fromName = _config["Brevo:FromName"];
        var brandName = string.IsNullOrWhiteSpace(fromName) ? "Accessories Store" : fromName;

        var payload = new
        {
            sender = new { name = fromName, email = fromEmail },
            to = new[] { new { email = toEmail, name = order.CustomerName } },
            subject = $"Order Confirmation - {order.OrderNumber}",
            htmlContent = BuildOrderConfirmationHtml(order, brandName)
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

    private static string BuildOrderConfirmationHtml(OrderDto order, string brandName)
    {
        var subtotal = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        var brand = Escape(brandName);

        var items = new StringBuilder();
        foreach (var item in order.Items)
        {
            items.Append($@"
              <tr>
                <td style=""padding:12px 8px;border-bottom:1px solid #eee6df;font-size:14px;color:#4a3b32;"">{Escape(item.ProductName)}</td>
                <td style=""padding:12px 8px;border-bottom:1px solid #eee6df;font-size:14px;color:#4a3b32;text-align:center;"">{item.Quantity}</td>
                <td style=""padding:12px 8px;border-bottom:1px solid #eee6df;font-size:14px;color:#4a3b32;text-align:right;"">{Money(item.UnitPrice)}</td>
                <td style=""padding:12px 8px;border-bottom:1px solid #eee6df;font-size:14px;color:#4a3b32;text-align:right;font-weight:600;"">{Money(item.UnitPrice * item.Quantity)}</td>
              </tr>");
        }

        var totals = new StringBuilder();
        totals.Append(TotalRow("Subtotal", Money(subtotal)));

        if (order.DiscountAmount > 0)
        {
            var label = string.IsNullOrWhiteSpace(order.PromoCode)
                ? "Discount"
                : $"Discount ({Escape(order.PromoCode)})";
            totals.Append(TotalRow(label, "&minus; " + Money(order.DiscountAmount), "#6b8f71"));
        }

        totals.Append(TotalRow("Shipping", order.ShippingFee > 0 ? Money(order.ShippingFee) : "Free"));

        return $@"<!DOCTYPE html>
<html>
  <head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
    <title>Order Confirmation</title>
  </head>
  <body style=""margin:0;padding:0;background-color:#f7f3ef;font-family:Helvetica,Arial,sans-serif;"">
    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f7f3ef;padding:24px 12px;"">
      <tr>
        <td align=""center"">
          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eee6df;"">
            <tr>
              <td style=""background-color:#3f2f26;padding:28px 24px;text-align:center;"">
                <h1 style=""margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;text-transform:uppercase;"">{brand}</h1>
                <p style=""margin:8px 0 0;color:#d9c9bd;font-size:13px;"">Order Confirmation</p>
              </td>
            </tr>
            <tr>
              <td style=""padding:28px 24px 8px;"">
                <p style=""margin:0 0 12px;font-size:16px;color:#3f2f26;"">Hi {Escape(order.CustomerName)},</p>
                <p style=""margin:0;font-size:14px;line-height:22px;color:#6b5b51;"">
                  Thank you for your order. We&rsquo;ve received it and it is now being prepared. Here is a summary of your purchase.
                </p>
              </td>
            </tr>
            <tr>
              <td style=""padding:20px 24px 0;"">
                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#faf7f4;border:1px solid #eee6df;border-radius:6px;"">
                  <tr>
                    <td style=""padding:14px 16px;font-size:13px;color:#6b5b51;"">
                      <strong style=""color:#3f2f26;"">Order Number:</strong> {Escape(order.OrderNumber)}
                    </td>
                    <td style=""padding:14px 16px;font-size:13px;color:#6b5b51;text-align:right;"">
                      <strong style=""color:#3f2f26;"">Order Date:</strong> {order.CreatedAt.ToString("dd MMM yyyy", CultureInfo.InvariantCulture)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style=""padding:24px 24px 0;"">
                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse:collapse;"">
                  <tr>
                    <th align=""left"" style=""padding:8px;border-bottom:2px solid #3f2f26;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#3f2f26;"">Item</th>
                    <th align=""center"" style=""padding:8px;border-bottom:2px solid #3f2f26;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#3f2f26;"">Qty</th>
                    <th align=""right"" style=""padding:8px;border-bottom:2px solid #3f2f26;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#3f2f26;"">Unit Price</th>
                    <th align=""right"" style=""padding:8px;border-bottom:2px solid #3f2f26;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#3f2f26;"">Total</th>
                  </tr>{items}
                </table>
              </td>
            </tr>
            <tr>
              <td style=""padding:16px 24px 0;"">
                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse:collapse;"">
                  {totals}
                  <tr>
                    <td style=""padding:12px 8px;border-top:2px solid #3f2f26;font-size:15px;font-weight:700;color:#3f2f26;"">Total</td>
                    <td style=""padding:12px 8px;border-top:2px solid #3f2f26;font-size:15px;font-weight:700;color:#3f2f26;text-align:right;"">{Money(order.TotalAmount)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style=""padding:24px 24px 0;"">
                <h2 style=""margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#3f2f26;"">Shipping Address</h2>
                <p style=""margin:0;font-size:14px;line-height:22px;color:#6b5b51;"">{EscapeMultiline(order.ShippingAddress)}</p>
              </td>
            </tr>
            <tr>
              <td style=""padding:24px;"">
                <p style=""margin:0;font-size:14px;line-height:22px;color:#6b5b51;"">
                  We will send you another update as soon as your order ships. If you have any questions, simply reply to this email.
                </p>
                <p style=""margin:16px 0 0;font-size:14px;color:#3f2f26;"">Warm regards,<br />The {brand} Team</p>
              </td>
            </tr>
            <tr>
              <td style=""background-color:#faf7f4;padding:16px 24px;text-align:center;border-top:1px solid #eee6df;"">
                <p style=""margin:0;font-size:12px;color:#9b8b80;"">&copy; {DateTime.UtcNow.Year} {brand}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";
    }

    private static string TotalRow(string label, string value, string? valueColor = null)
    {
        var color = valueColor ?? "#3f2f26";
        return $@"
                  <tr>
                    <td style=""padding:6px 8px;font-size:14px;color:#6b5b51;"">{label}</td>
                    <td style=""padding:6px 8px;font-size:14px;color:{color};text-align:right;"">{value}</td>
                  </tr>";
    }

    private static string Money(decimal amount) =>
        "LE " + amount.ToString("N2", CultureInfo.InvariantCulture);

    private static string Escape(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);

    private static string EscapeMultiline(string? value) =>
        Escape(value).Replace("\r\n", "<br />").Replace("\n", "<br />");
}
