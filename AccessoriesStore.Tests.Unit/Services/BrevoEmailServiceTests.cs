using Xunit;
using FluentAssertions;
using Moq;
using AccessoriesStore.Api.Services;
using AccessoriesStore.Api.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AccessoriesStore.Tests.Unit.Services;

public class BrevoEmailServiceTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly Mock<ILogger<BrevoEmailService>> _mockLogger;
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly BrevoEmailService _service;

    public BrevoEmailServiceTests()
    {
        _mockConfig = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<BrevoEmailService>>();
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();

        // Setup default config values
        _mockConfig.Setup(c => c["Brevo:ApiKey"]).Returns("test-api-key");
        _mockConfig.Setup(c => c["Brevo:FromEmail"]).Returns("noreply@accessories.store");
        _mockConfig.Setup(c => c["Brevo:FromName"]).Returns("Accessories Store");

        var httpClient = new HttpClient();
        _mockHttpClientFactory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);
        _mockHttpClientFactory.Setup(f => f.CreateClient()).Returns(httpClient);

        _service = new BrevoEmailService(_mockConfig.Object, _mockLogger.Object, _mockHttpClientFactory.Object);
    }

    [Fact]
    public async Task SendOrderConfirmationAsync_WithValidOrder_ShouldNotThrow()
    {
        // Arrange
        var orderDto = new OrderDto
        {
            Id = 1,
            OrderNumber = "ORD-20260824-ABC123",
            CustomerName = "John Doe",
            CustomerEmail = "john@example.com",
            CustomerPhone = "+201234567890",
            ShippingAddress = "123 Main St, Cairo",
            Status = "Pending",
            StatusChangedAt = DateTime.UtcNow,
            TotalAmount = 250m,
            ShippingFee = 50m,
            DiscountAmount = 25m,
            PromoCode = "SAVE10",
            CreatedAt = DateTime.UtcNow,
            Items = new List<OrderItemDto>
            {
                new OrderItemDto
                {
                    ProductId = 1,
                    ProductName = "Test Product",
                    CategoryName = "Accessories",
                    Quantity = 2,
                    UnitPrice = 100m
                }
            }
        };

        // Act & Assert
        var act = async () => await _service.SendOrderConfirmationAsync(orderDto.CustomerEmail, orderDto);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task SendOrderConfirmationAsync_WithNullEmail_ShouldNotThrow()
    {
        // Arrange
        var orderDto = new OrderDto
        {
            Id = 1,
            OrderNumber = "ORD-20260824-ABC123",
            CustomerName = "John Doe",
            CustomerEmail = "john@example.com",
            Items = new List<OrderItemDto>()
        };

        // Act & Assert - should handle gracefully
        var act = async () => await _service.SendOrderConfirmationAsync(null!, orderDto);
        await act.Should().NotThrowAsync();
    }
}
