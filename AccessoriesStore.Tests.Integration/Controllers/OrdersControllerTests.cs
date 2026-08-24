using Xunit;
using FluentAssertions;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Tests.Integration.Fixtures;
using AccessoriesStore.Tests.Integration.Mocks;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class OrdersControllerTests : IAsyncLifetime
{
    private TestDatabaseFixture _fixture = null!;
    private AppDbContext _context = null!;
    private MockEmailService _mockEmailService = null!;

    public async Task InitializeAsync()
    {
        _fixture = new TestDatabaseFixture();
        await _fixture.InitializeAsync();
        _context = _fixture.DbContext;
        _mockEmailService = new MockEmailService();
    }

    public async Task DisposeAsync()
    {
        await _fixture.DisposeAsync();
    }

    [Fact]
    public async Task CreateOrder_WithValidData_ShouldSaveToDatabase()
    {
        // Arrange
        var category = TestDataBuilder.CreateCategory().Build();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var product = TestDataBuilder.CreateProduct()
            .WithName("Test Product")
            .WithPrice(100m)
            .WithStockQuantity(10)
            .WithCategory(category)
            .Build();

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var order = TestDataBuilder.CreateOrder()
            .WithCustomerEmail("test@example.com")
            .WithTotalAmount(100m)
            .Build();

        // Act
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var saved = _context.Orders.FirstOrDefault(o => o.CustomerEmail == "test@example.com");

        // Assert
        saved.Should().NotBeNull();
        saved!.CustomerEmail.Should().Be("test@example.com");
        saved.TotalAmount.Should().Be(100m);
    }

    [Fact]
    public async Task OrderWithPromoCode_ShouldPersistPromoCodeReference()
    {
        // Arrange
        var order = TestDataBuilder.CreateOrder()
            .WithPromoCode("SAVE10")
            .WithDiscountAmount(10m)
            .Build();

        // Act
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var retrieved = _context.Orders.FirstOrDefault(o => o.PromoCode == "SAVE10");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.PromoCode.Should().Be("SAVE10");
        retrieved.DiscountAmount.Should().Be(10m);
    }

    [Fact]
    public async Task OrderStatusHistory_ShouldTrackStatusChanges()
    {
        // Arrange
        var order = TestDataBuilder.CreateOrder().Build();
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var statusHistory = new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Shipped,
            ChangedAt = DateTime.UtcNow,
            Note = "Order shipped"
        };

        // Act
        _context.OrderStatusHistories.Add(statusHistory);
        await _context.SaveChangesAsync();

        var history = _context.OrderStatusHistories
            .Where(h => h.OrderId == order.Id)
            .ToList();

        // Assert
        history.Should().NotBeEmpty();
        history.Should().Contain(h => h.Status == OrderStatus.Shipped);
    }

    [Fact]
    public void MockEmailService_ShouldTrackSentEmails()
    {
        // Arrange
        var order = TestDataBuilder.CreateOrder().Build();

        // Act
        var task = _mockEmailService.SendOrderConfirmationAsync("test@example.com", new AccessoriesStore.Api.DTOs.OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            Items = new List<AccessoriesStore.Api.DTOs.OrderItemDto>()
        });
        task.Wait();

        // Assert
        _mockEmailService.SentEmails.Should().HaveCount(1);
        _mockEmailService.SentEmails[0].ToEmail.Should().Be("test@example.com");
    }
}
