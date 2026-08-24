using System.Net;
using System.Net.Http.Json;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Fixtures;
using FluentAssertions;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class CategoriesControllerTests : ApiTestBase
{
    public CategoriesControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetCategories_ReturnsCreatedCategories()
    {
        using var admin = await Factory.CreateAuthenticatedClientAsync();
        await admin.PostAsJsonAsync("/api/categories", new CreateCategoryDto { Name = "Necklaces", Description = "Fine" });

        var response = await Client.GetAsync("/api/categories");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var categories = await response.Content.ReadFromJsonAsync<List<CategoryDto>>(CustomWebApplicationFactory.JsonOptions);
        categories.Should().ContainSingle(c => c.Name == "Necklaces");
    }

    [Fact]
    public async Task GetCategory_WhenMissing_ReturnsNotFound()
    {
        var response = await Client.GetAsync("/api/categories/999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCategory_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await Client.PostAsJsonAsync("/api/categories", new CreateCategoryDto { Name = "Rings" });
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateAndDeleteCategory_WhenEmpty_Succeeds()
    {
        using var admin = await Factory.CreateAuthenticatedClientAsync();
        var created = await admin.PostAsJsonAsync("/api/categories", new CreateCategoryDto { Name = "Temp", Description = "x" });
        var category = await created.Content.ReadFromJsonAsync<CategoryDto>(CustomWebApplicationFactory.JsonOptions);

        var updated = await admin.PutAsJsonAsync($"/api/categories/{category!.Id}", new UpdateCategoryDto { Name = "Updated", Description = "y" });
        updated.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var fetched = await Client.GetFromJsonAsync<CategoryDto>($"/api/categories/{category.Id}", CustomWebApplicationFactory.JsonOptions);
        fetched!.Name.Should().Be("Updated");

        var deleted = await admin.DeleteAsync($"/api/categories/{category.Id}");
        deleted.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteCategory_WhenProductsExist_ReturnsBadRequest()
    {
        await Factory.SeedProductAsync();
        using var admin = await Factory.CreateAuthenticatedClientAsync();
        var categories = await Client.GetFromJsonAsync<List<CategoryDto>>("/api/categories", CustomWebApplicationFactory.JsonOptions);

        var response = await admin.DeleteAsync($"/api/categories/{categories![0].Id}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
