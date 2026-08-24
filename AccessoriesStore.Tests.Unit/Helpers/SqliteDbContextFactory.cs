using AccessoriesStore.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AccessoriesStore.Tests.Unit.Helpers;

internal sealed class SqliteDbContextFactory : IAsyncDisposable, IDisposable
{
    private readonly SqliteConnection _connection;

    private SqliteDbContextFactory(SqliteConnection connection)
    {
        _connection = connection;
    }

    public static async Task<SqliteDbContextFactory> CreateAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var factory = new SqliteDbContextFactory(connection);
        await using var context = factory.CreateContext();
        await context.Database.EnsureCreatedAsync();
        return factory;
    }

    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        return new AppDbContext(options);
    }

    public void Dispose() => _connection.Dispose();

    public async ValueTask DisposeAsync() => await _connection.DisposeAsync();
}
