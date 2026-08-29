using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AccessoriesStore.Api;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Api.Services;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Mocks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace AccessoriesStore.Tests.Integration.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    public string DbPath { get; } = Path.Combine(Path.GetTempPath(), $"accessories-store-{Guid.NewGuid():N}.db");
    public MockEmailService Email { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "integration-test-jwt-key-32-chars-min!",
                ["Jwt:Issuer"] = "AccessoriesStoreApi",
                ["Jwt:Audience"] = "AccessoriesStoreAdmin",
                ["Jwt:ExpiryMinutes"] = "120"
            });
        });

        builder.ConfigureTestServices(services =>
        {
            RemoveDbContext(services);
            services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={DbPath};Pooling=False"));
            services.RemoveAll<IEmailService>();
            services.AddSingleton(Email);
            services.AddSingleton<IEmailService>(sp => sp.GetRequiredService<MockEmailService>());
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        return host;
    }

    public async Task ResetDatabaseAsync()
    {
        Email.Reset();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    public async Task<T> UsingDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await action(db);
    }

    public async Task UsingDbAsync(Func<AppDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await action(db);
    }

    public async Task<Product> SeedProductAsync(Action<Product>? configure = null, Action<Category>? configureCategory = null)
    {
        return await UsingDbAsync(async db =>
        {
            var category = new Category { Name = "Earrings", Description = "Jewelry" };
            configureCategory?.Invoke(category);
            db.Categories.Add(category);
            await db.SaveChangesAsync();

            var product = new Product
            {
                Name = "Gold Hoops",
                Description = "Classic hoops",
                Price = 100m,
                StockQuantity = 10,
                IsActive = true,
                CategoryId = category.Id
            };
            configure?.Invoke(product);
            db.Products.Add(product);
            await db.SaveChangesAsync();
            return product;
        });
    }

    public async Task<string> GetAdminTokenAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterAdminDto
        {
            FullName = "Test Admin",
            Email = $"admin-{Guid.NewGuid():N}@store.test",
            Password = "Password1!"
        });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
        return body!.Token;
    }

    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = CreateClient();
        var token = await GetAdminTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (File.Exists(DbPath))
            File.Delete(DbPath);
    }

    private static void RemoveDbContext(IServiceCollection services)
    {
        var descriptors = services
            .Where(d =>
                d.ServiceType == typeof(AppDbContext) ||
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                (d.ServiceType.IsGenericType &&
                    (d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>) ||
                     d.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>))))
            .ToList();

        foreach (var descriptor in descriptors)
            services.Remove(descriptor);
    }
}
