using System.Net;
using System.Net.Http.Json;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Fixtures;
using FluentAssertions;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class OrdersControllerTests : ApiTestBase
{
    public OrdersControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateOrder_EmptyItems_ReturnsBadRequest()
    {
        var response = await Client.PostAsJsonAsync("/api/orders", new CreateOrderDto
        {
            CustomerName = "Aya",
            CustomerEmail = "aya@test.com",
            CustomerPhone = "010",
            ShippingAddress = "Cairo",
            Items = []
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateOrder_UnknownProduct_ReturnsBadRequest()
    {
        var response = await Client.PostAsJsonAsync("/api/orders", GuestOrder(999));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateOrder_InactiveProduct_ReturnsBadRequest()
    {
        var product = await Factory.SeedProductAsync(p => p.IsActive = false);
        var response = await Client.PostAsJsonAsync("/api/orders", GuestOrder(product.Id));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateOrder_InsufficientStock_ReturnsBadRequest()
    {
        var product = await Factory.SeedProductAsync(p => p.StockQuantity = 1);
        var dto = GuestOrder(product.Id);
        dto.Items[0].Quantity = 2;

        var response = await Client.PostAsJsonAsync("/api/orders", dto);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateOrder_UsesDatabasePriceAndDecrementsStock()
    {
        var product = await Factory.SeedProductAsync(p =>
        {
            p.Price = 120m;
            p.StockQuantity = 5;
        });

        var response = await Client.PostAsJsonAsync("/api/orders", GuestOrder(product.Id, 2));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>(CustomWebApplicationFactory.JsonOptions);
        order!.Items.Should().ContainSingle();
        order.Items[0].UnitPrice.Should().Be(120m);
        order.TotalAmount.Should().Be(240m);
        order.Status.Should().Be(nameof(OrderStatus.Pending));
        Factory.Email.SentEmails.Should().ContainSingle(e => e.ToEmail == "aya@test.com");

        await Factory.UsingDbAsync(async db =>
        {
            var updated = await db.Products.FindAsync(product.Id);
            updated!.StockQuantity.Should().Be(3);
        });
    }

    [Fact]
    public async Task CreateOrder_AppliesSalePriceFreeShippingAndPromo()
    {
        var product = await Factory.SeedProductAsync(p =>
        {
            p.Price = 200m;
            p.SalePrice = 150m;
            p.IsOnSale = true;
            p.StockQuantity = 5;
        });

        await Factory.UsingDbAsync(async db =>
        {
            db.ShippingSettings.Add(new ShippingSettings { ShippingFee = 40, FreeShippingThreshold = 200 });
            db.PromoCodes.Add(new PromoCode { Code = "SAVE10", IsPercentage = true, DiscountValue = 10, IsActive = true });
            await db.SaveChangesAsync();
        });

        var dto = GuestOrder(product.Id, 2);
        dto.PromoCode = "save10";
        var response = await Client.PostAsJsonAsync("/api/orders", dto);

        var order = await response.Content.ReadFromJsonAsync<OrderDto>(CustomWebApplicationFactory.JsonOptions);
        order!.Items[0].UnitPrice.Should().Be(150m);
        order.DiscountAmount.Should().Be(30m);
        order.ShippingFee.Should().Be(0m);
        order.PromoCode.Should().Be("SAVE10");
        order.TotalAmount.Should().Be(270m);
    }

    [Fact]
    public async Task CreateOrder_StillSucceedsWhenEmailThrows()
    {
        Factory.Email.ShouldThrow = true;
        var product = await Factory.SeedProductAsync();

        var response = await Client.PostAsJsonAsync("/api/orders", GuestOrder(product.Id));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task TrackOrder_RequiresMatchingEmail()
    {
        var product = await Factory.SeedProductAsync();
        var created = await Client.PostAsJsonAsync("/api/orders", GuestOrder(product.Id));
        var order = await created.Content.ReadFromJsonAsync<OrderDto>(CustomWebApplicationFactory.JsonOptions);

        var missing = await Client.GetAsync($"/api/orders/track?orderNumber={order!.OrderNumber}&email=other@test.com");
        missing.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var found = await Client.GetAsync($"/api/orders/track?orderNumber={order.OrderNumber}&email=aya@test.com");
        found.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetAllAndUpdateStatus_RequireAuth()
    {
        var product = await Factory.SeedProductAsync();
        var created = await Client.PostAsJsonAsync("/api/orders", GuestOrder(product.Id));
        var order = await created.Content.ReadFromJsonAsync<OrderDto>(CustomWebApplicationFactory.JsonOptions);

        (await Client.GetAsync("/api/orders")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        using var admin = await Factory.CreateAuthenticatedClientAsync();
        var list = await admin.GetFromJsonAsync<List<OrderDto>>("/api/orders", CustomWebApplicationFactory.JsonOptions);
        list.Should().ContainSingle(o => o.Id == order!.Id);

        var updated = await admin.PutAsJsonAsync($"/api/orders/{order!.Id}/status", new UpdateOrderStatusDto
        {
            Status = OrderStatus.Shipped,
            Note = "Out for delivery"
        });
        updated.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var fetched = await Client.GetFromJsonAsync<OrderDto>($"/api/orders/{order.Id}", CustomWebApplicationFactory.JsonOptions);
        fetched!.Status.Should().Be(nameof(OrderStatus.Shipped));
    }

    private static CreateOrderDto GuestOrder(int productId, int quantity = 1) => new()
    {
        CustomerName = "Aya",
        CustomerEmail = "aya@test.com",
        CustomerPhone = "01000000000",
        ShippingAddress = "Cairo",
        Items = [new CreateOrderItemDto { ProductId = productId, Quantity = quantity }]
    };
}
