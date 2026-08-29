using System.Net;
using System.Net.Http.Json;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Fixtures;
using FluentAssertions;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class ProductsControllerTests : ApiTestBase
{
    public ProductsControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetProducts_OmitsInactiveProducts()
    {
        await Factory.SeedProductAsync(p => p.Name = "Visible");
        await Factory.SeedProductAsync(p =>
        {
            p.Name = "Hidden";
            p.IsActive = false;
        });

        var products = await Client.GetFromJsonAsync<List<ProductDto>>("/api/products", CustomWebApplicationFactory.JsonOptions);

        products.Should().Contain(p => p.Name == "Visible");
        products.Should().NotContain(p => p.Name == "Hidden");
    }

    [Fact]
    public async Task GetProduct_WhenMissing_ReturnsNotFound()
    {
        var response = await Client.GetAsync("/api/products/404");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetProduct_WhenInactive_ReturnsNotFound()
    {
        var product = await Factory.SeedProductAsync(p => p.IsActive = false);

        var response = await Client.GetAsync($"/api/products/{product.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AdminAll_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await Client.GetAsync("/api/products/admin/all");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminAll_IncludesInactiveProducts()
    {
        await Factory.SeedProductAsync(p =>
        {
            p.Name = "Hidden";
            p.IsActive = false;
        });
        using var admin = await Factory.CreateAuthenticatedClientAsync();

        var products = await admin.GetFromJsonAsync<List<ProductDto>>("/api/products/admin/all", CustomWebApplicationFactory.JsonOptions);

        products.Should().Contain(p => p.Name == "Hidden" && !p.IsActive);
    }

    [Fact]
    public async Task CreateUpdateDeleteProduct_RequiresAuthAndValidCategory()
    {
        using var admin = await Factory.CreateAuthenticatedClientAsync();
        var categoryResponse = await admin.PostAsJsonAsync("/api/categories", new CreateCategoryDto { Name = "Bags" });
        var category = await categoryResponse.Content.ReadFromJsonAsync<CategoryDto>(CustomWebApplicationFactory.JsonOptions);

        var invalid = await admin.PostAsJsonAsync("/api/products", new CreateProductDto
        {
            Name = "Tote",
            Price = 250,
            StockQuantity = 3,
            CategoryId = 999
        });
        invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var created = await admin.PostAsJsonAsync("/api/products", new CreateProductDto
        {
            Name = "Tote",
            Description = "Canvas",
            Price = 250,
            StockQuantity = 3,
            CategoryId = category!.Id
        });
        created.StatusCode.Should().Be(HttpStatusCode.Created);
        var product = await created.Content.ReadFromJsonAsync<ProductDto>(CustomWebApplicationFactory.JsonOptions);

        var updated = await admin.PutAsJsonAsync($"/api/products/{product!.Id}", new UpdateProductDto
        {
            Name = "Leather Tote",
            Price = 300,
            SalePrice = 240,
            IsOnSale = true,
            StockQuantity = 2,
            IsActive = true,
            CategoryId = category.Id
        });
        updated.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var fetched = await Client.GetFromJsonAsync<ProductDto>($"/api/products/{product.Id}", CustomWebApplicationFactory.JsonOptions);
        fetched!.Name.Should().Be("Leather Tote");
        fetched.IsOnSale.Should().BeTrue();
        fetched.SalePrice.Should().Be(240);

        var deleted = await admin.DeleteAsync($"/api/products/{product.Id}");
        deleted.StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await Client.GetAsync($"/api/products/{product.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
