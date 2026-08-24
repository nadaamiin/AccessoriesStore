# AccessoriesStore.Tests.Unit

Unit tests for the AccessoriesStore API project. These tests focus on individual services and utilities in isolation using mocks for dependencies.

## Structure

- **Services/** - Tests for business logic services (PromoCodeService, BrevoEmailService, etc.)
- **DTOs/** - Tests for data transfer objects and their validation
- **Utilities/** - Tests for helper functions and utilities

## Running Tests

From the solution root:

```bash
# Run all unit tests
dotnet test AccessoriesStore.Tests.Unit

# Run specific test class
dotnet test AccessoriesStore.Tests.Unit --filter "ClassName~PromoCodeServiceTests"

# Run with verbose output
dotnet test AccessoriesStore.Tests.Unit --verbosity normal
```

## Writing Unit Tests

### Example Pattern

```csharp
public class MyServiceTests
{
    private readonly Mock<IDependency> _mockDependency;
    private readonly MyService _service;

    public MyServiceTests()
    {
        _mockDependency = new Mock<IDependency>();
        _service = new MyService(_mockDependency.Object);
    }

    [Fact]
    public void MyMethod_WithValidInput_ShouldReturnExpected()
    {
        // Arrange
        var input = "test";

        // Act
        var result = _service.MyMethod(input);

        // Assert
        result.Should().Be("expected");
    }
}
```

## Dependencies

- **xUnit** - Testing framework
- **Moq** - Mocking library
- **FluentAssertions** - Assertion library for readable test assertions
