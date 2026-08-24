# AccessoriesStore.Tests.Integration

Integration tests for the AccessoriesStore API project. These tests verify interactions between components including database access, API controllers, and services working together.

## Structure

- **Controllers/** - Tests for API controller endpoints
- **Data/** - Tests for database context and entity persistence
- **Fixtures/** - Reusable test infrastructure and data builders
- **Mocks/** - Mock implementations of external services

## Running Tests

From the solution root:

```bash
# Run all integration tests
dotnet test AccessoriesStore.Tests.Integration

# Run specific test class
dotnet test AccessoriesStore.Tests.Integration --filter "ClassName~OrdersControllerTests"

# Run with verbose output
dotnet test AccessoriesStore.Tests.Integration --verbosity normal
```

## Test Database

Integration tests use an **in-memory SQLite database** that is created fresh for each test. This ensures:
- Fast execution
- Isolation between tests
- No external dependencies
- Database schema matches production

### Using TestDatabaseFixture

Inherit from `IAsyncLifetime` and use the fixture:

```csharp
public class MyIntegrationTests : IAsyncLifetime
{
    private TestDatabaseFixture _fixture = null!;
    private AppDbContext _context = null!;

    public async Task InitializeAsync()
    {
        _fixture = new TestDatabaseFixture();
        await _fixture.InitializeAsync();
        _context = _fixture.DbContext;
    }

    public async Task DisposeAsync()
    {
        await _fixture.DisposeAsync();
    }

    [Fact]
    public async Task MyTest()
    {
        // Use _context here
    }
}
```

## Test Data Builders

Use `TestDataBuilder` to create domain entities with sensible defaults:

```csharp
// Create a test product
var product = TestDataBuilder.CreateProduct()
    .WithName("Test Product")
    .WithPrice(99.99m)
    .WithStockQuantity(10)
    .Build();

// Create a test order with promo code
var order = TestDataBuilder.CreateOrder()
    .WithCustomerEmail("test@example.com")
    .WithPromoCode("SAVE10")
    .WithTotalAmount(150m)
    .Build();
```

## Mock Services

### MockEmailService

Tracks email sending without hitting Brevo API:

```csharp
var mockEmail = new MockEmailService();
await mockEmail.SendOrderConfirmationAsync("test@example.com", orderDto);

// Assert email was sent
mockEmail.SentEmails.Should().HaveCount(1);
mockEmail.SentEmails[0].ToEmail.Should().Be("test@example.com");
```

### MockPromoCodeService

Allows configuring promo code validation results:

```csharp
var mockPromo = new MockPromoCodeService();
mockPromo.SetCodeResult("SAVE20", true, 20m, "20% off");

var result = await mockPromo.ValidateAsync("SAVE20", 100m);
result.Valid.Should().BeTrue();
```

## Dependencies

- **xUnit** - Testing framework
- **Moq** - Mocking library
- **FluentAssertions** - Assertion library
- **Microsoft.AspNetCore.Mvc.Testing** - Test host for controller testing
- **Microsoft.EntityFrameworkCore.Sqlite** - In-memory database for tests
