using System.Net;
using System.Text;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace AccessoriesStore.Tests.Unit.Services;

public class BrevoEmailServiceTests
{
    [Fact]
    public async Task SendOrderConfirmationAsync_PostsHtmlPayloadToBrevo()
    {
        var handler = new RecordingHandler(HttpStatusCode.Created);
        var service = CreateService(handler);
        var order = SampleOrder();

        await service.SendOrderConfirmationAsync("buyer@example.com", order);

        handler.Request.Should().NotBeNull();
        handler.Request!.Method.Should().Be(HttpMethod.Post);
        handler.Request.RequestUri!.ToString().Should().Be("https://api.brevo.com/v3/smtp/email");
        handler.Request.Headers.GetValues("api-key").Single().Should().Be("test-api-key");
        handler.Body.Should().Contain("buyer@example.com");
        handler.Body.Should().Contain("ORD-20260824-ABC123");
        handler.Body.Should().Contain("Gold Hoop Earrings");
        handler.Body.Should().Contain("Discount (SAVE10)");
        handler.Body.Should().Contain("LE 200.00");
        handler.Body.Should().Contain("&lt;script&gt;");
    }

    [Fact]
    public async Task SendOrderConfirmationAsync_WhenBrevoFails_DoesNotThrow()
    {
        var handler = new RecordingHandler(HttpStatusCode.BadRequest, "invalid sender");
        var service = CreateService(handler);

        var act = async () => await service.SendOrderConfirmationAsync("buyer@example.com", SampleOrder());

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task SendOrderConfirmationAsync_UsesFallbackBrandNameWhenFromNameMissing()
    {
        var handler = new RecordingHandler(HttpStatusCode.OK);
        var service = CreateService(handler, fromName: " ");

        await service.SendOrderConfirmationAsync("buyer@example.com", SampleOrder());

        handler.Body.Should().Contain("Accessories Store");
    }

    private static BrevoEmailService CreateService(RecordingHandler handler, string? fromName = "Nara")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Brevo:ApiKey"] = "test-api-key",
                ["Brevo:FromEmail"] = "store@example.com",
                ["Brevo:FromName"] = fromName
            })
            .Build();

        var httpClient = new HttpClient(handler);
        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        return new BrevoEmailService(config, NullLogger<BrevoEmailService>.Instance, factory.Object);
    }

    private static OrderDto SampleOrder() => new()
    {
        Id = 1,
        OrderNumber = "ORD-20260824-ABC123",
        CustomerName = "<script>Jane</script>",
        CustomerEmail = "jane@example.com",
        CustomerPhone = "01000000000",
        ShippingAddress = "12 Nile St\nCairo",
        Status = "Pending",
        StatusChangedAt = DateTime.UtcNow,
        TotalAmount = 225m,
        ShippingFee = 50m,
        DiscountAmount = 25m,
        PromoCode = "SAVE10",
        CreatedAt = new DateTime(2026, 8, 24, 0, 0, 0, DateTimeKind.Utc),
        Items =
        [
            new OrderItemDto
            {
                ProductId = 1,
                ProductName = "Gold Hoop Earrings",
                CategoryName = "Earrings",
                Quantity = 2,
                UnitPrice = 100m
            }
        ]
    };

    private sealed class RecordingHandler : HttpMessageHandler
    {
        private readonly HttpStatusCode _status;
        private readonly string _responseBody;

        public RecordingHandler(HttpStatusCode status, string responseBody = "{}")
        {
            _status = status;
            _responseBody = responseBody;
        }

        public HttpRequestMessage? Request { get; private set; }
        public string Body { get; private set; } = string.Empty;

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Request = request;
            Body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(_status)
            {
                Content = new StringContent(_responseBody, Encoding.UTF8, "application/json")
            };
        }
    }
}
