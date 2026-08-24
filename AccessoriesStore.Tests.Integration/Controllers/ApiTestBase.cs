using AccessoriesStore.Tests.Integration.Fixtures;

namespace AccessoriesStore.Tests.Integration.Controllers;

public abstract class ApiTestBase : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    protected ApiTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
    }

    protected CustomWebApplicationFactory Factory { get; }
    protected HttpClient Client { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
        Client = Factory.CreateClient();
    }

    public Task DisposeAsync()
    {
        Client.Dispose();
        return Task.CompletedTask;
    }
}
