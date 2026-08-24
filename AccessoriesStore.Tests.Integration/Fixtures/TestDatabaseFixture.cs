using AccessoriesStore.Api.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AccessoriesStore.Tests.Integration.Fixtures;

/// <summary>
/// Fixture for setting up an in-memory SQLite database for integration tests.
/// Use this fixture in test classes to get a fresh database context for each test.
/// </summary>
public class TestDatabaseFixture : IAsyncLifetime
{
    private DbContextOptions<AppDbContext>? _options;
    public AppDbContext DbContext { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        // Use in-memory SQLite for testing
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;

        DbContext = new AppDbContext(_options);
        await DbContext.Database.OpenConnectionAsync();
        await DbContext.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        if (DbContext != null)
        {
            await DbContext.Database.EnsureDeletedAsync();
            await DbContext.Database.CloseConnectionAsync();
            DbContext.Dispose();
        }
    }

    /// <summary>
    /// Reset the database to a clean state for a new test.
    /// </summary>
    public async Task ResetAsync()
    {
        await DbContext.Database.EnsureDeletedAsync();
        await DbContext.Database.EnsureCreatedAsync();
    }
}
