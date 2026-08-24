using Xunit;
using FluentAssertions;
using AccessoriesStore.Tests.Integration.Fixtures;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Tests.Integration.Data;

public class AppDbContextTests : IAsyncLifetime
{
    private TestDatabaseFixture _fixture = null!;

    public async Task InitializeAsync()
    {
        _fixture = new TestDatabaseFixture();
        await _fixture.InitializeAsync();
    }

    public async Task DisposeAsync()
    {
        await _fixture.DisposeAsync();
    }

    [Fact]
    public async Task DbContext_ShouldCreateDatabase()
    {
        // Act & Assert
        var context = _fixture.DbContext;
        var canConnect = await context.Database.CanConnectAsync();
        canConnect.Should().BeTrue();
    }

    [Fact]
    public async Task Category_ShouldBeInsertedAndRetrieved()
    {
        // Arrange
        var category = TestDataBuilder.CreateCategory()
            .WithName("Shoes")
            .Build();

        var context = _fixture.DbContext;

        // Act
        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var retrieved = context.Categories.FirstOrDefault(c => c.Name == "Shoes");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Name.Should().Be("Shoes");
    }

    [Fact]
    public async Task Product_WithCategory_ShouldBeInsertedAndRetrieved()
    {
        // Arrange
        var category = TestDataBuilder.CreateCategory().Build();
        var product = TestDataBuilder.CreateProduct()
            .WithName("Leather Shoes")
            .WithPrice(250m)
            .WithCategory(category)
            .Build();

        var context = _fixture.DbContext;

        // Act
        context.Categories.Add(category);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var retrieved = context.Products
            .FirstOrDefault(p => p.Name == "Leather Shoes");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Price.Should().Be(250m);
    }

    [Fact]
    public async Task Order_ShouldBeInsertedWithStatusHistory()
    {
        // Arrange
        var order = TestDataBuilder.CreateOrder()
            .WithOrderNumber("ORD-20260824-TEST01")
            .WithStatus(OrderStatus.Pending)
            .Build();

        var context = _fixture.DbContext;

        // Act
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        var statusHistory = new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Pending,
            ChangedAt = DateTime.UtcNow,
            Note = "Order placed"
        };

        context.OrderStatusHistories.Add(statusHistory);
        await context.SaveChangesAsync();

        var retrieved = context.Orders.FirstOrDefault(o => o.OrderNumber == "ORD-20260824-TEST01");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public async Task PromoCode_ShouldBeInsertedAndQueried()
    {
        // Arrange
        var promoCode = TestDataBuilder.CreatePromoCode()
            .WithCode("SUMMER20")
            .WithIsPercentage(true)
            .WithDiscountValue(20)
            .Build();

        var context = _fixture.DbContext;

        // Act
        context.PromoCodes.Add(promoCode);
        await context.SaveChangesAsync();

        var retrieved = context.PromoCodes
            .FirstOrDefault(p => p.Code == "SUMMER20");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.DiscountValue.Should().Be(20);
        retrieved.IsPercentage.Should().BeTrue();
    }
}
