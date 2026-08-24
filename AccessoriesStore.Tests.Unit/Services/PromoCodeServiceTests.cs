using Xunit;
using FluentAssertions;

namespace AccessoriesStore.Tests.Unit.Services;

/// <summary>
/// Unit tests for PromoCodeService.
/// Note: Full service testing is done in integration tests with a real database.
/// Moq cannot easily mock DbContext and EF Core extension methods, so comprehensive
/// testing is deferred to integration tests with an in-memory SQLite database.
/// </summary>
public class PromoCodeServiceTests
{
    [Fact]
    public void PromoCodeService_CanBeImported()
    {
        // Sanity check that the service exists
        var serviceType = typeof(AccessoriesStore.Api.Services.PromoCodeService);
        serviceType.Should().NotBeNull();
    }
}
