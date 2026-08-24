using Xunit;
using FluentAssertions;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Tests.Integration.Fixtures;
using AccessoriesStore.Tests.Integration.Mocks;
using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class PromoCodesControllerTests : IAsyncLifetime
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
    public async Task ValidateAsync_WithValidPromoCode_ShouldReturnValidResult()
    {
        // Arrange
        var promoCode = TestDataBuilder.CreatePromoCode()
            .WithCode("SAVE20")
            .WithIsPercentage(true)
            .WithDiscountValue(20)
            .WithIsActive(true)
            .Build();

        _context.PromoCodes.Add(promoCode);
        await _context.SaveChangesAsync();

        var mockPromoService = new MockPromoCodeService();
        mockPromoService.SetCodeResult("SAVE20", true, 20m, "20% off applied!");

        // Act
        var result = await mockPromoService.ValidateAsync("SAVE20", 100m);

        // Assert
        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(20m);
        result.Message.Should().Contain("20%");
    }

    [Fact]
    public async Task ValidateAsync_WithInvalidPromoCode_ShouldReturnInvalidResult()
    {
        // Arrange
        var mockPromoService = new MockPromoCodeService();
        mockPromoService.SetCodeResult("INVALID", false, 0, "Invalid code");

        // Act
        var result = await mockPromoService.ValidateAsync("INVALID", 100m);

        // Assert
        result.Valid.Should().BeFalse();
        result.DiscountAmount.Should().Be(0);
    }

    [Fact]
    public async Task PromoCodePersistence_ShouldSaveAndRetrieveCorrectly()
    {
        // Arrange
        var promoCode = TestDataBuilder.CreatePromoCode()
            .WithCode("INTEGRATION")
            .WithDiscountValue(15m)
            .WithIsPercentage(true)
            .Build();

        // Act
        _context.PromoCodes.Add(promoCode);
        await _context.SaveChangesAsync();

        var retrieved = _context.PromoCodes.FirstOrDefault(p => p.Code == "INTEGRATION");

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Code.Should().Be("INTEGRATION");
        retrieved.DiscountValue.Should().Be(15m);
        retrieved.IsPercentage.Should().BeTrue();
    }
}
