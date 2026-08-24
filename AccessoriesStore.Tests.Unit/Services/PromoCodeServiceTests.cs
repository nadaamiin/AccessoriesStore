using Xunit;
using FluentAssertions;
using Moq;
using AccessoriesStore.Api.Data;
using AccessoriesStore.Api.Services;
using AccessoriesStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccessoriesStore.Tests.Unit.Services;

public class PromoCodeServiceTests
{
    private readonly Mock<AppDbContext> _mockContext;
    private readonly PromoCodeService _service;

    public PromoCodeServiceTests()
    {
        _mockContext = new Mock<AppDbContext>();
        _service = new PromoCodeService(_mockContext.Object);
    }

    [Fact]
    public async Task ValidateAsync_WithNullCode_ShouldReturnInvalid()
    {
        // Arrange
        var subtotal = 100m;

        // Act
        var result = await _service.ValidateAsync(null, subtotal);

        // Assert
        result.Valid.Should().BeFalse();
        result.DiscountAmount.Should().Be(0);
        result.Message.Should().Contain("code");
    }

    [Fact]
    public async Task ValidateAsync_WithEmptyCode_ShouldReturnInvalid()
    {
        // Arrange
        var subtotal = 100m;

        // Act
        var result = await _service.ValidateAsync("   ", subtotal);

        // Assert
        result.Valid.Should().BeFalse();
        result.DiscountAmount.Should().Be(0);
        result.Message.Should().Contain("code");
    }

    [Theory]
    [InlineData("PERCENT20", true, 20, 100, 20)]
    [InlineData("FIXED10", false, 10, 100, 10)]
    public async Task ValidateAsync_WithValidPercentageCode_ShouldCalculateDiscount(
        string code, bool isPercentage, decimal discountValue, decimal subtotal, decimal expectedDiscount)
    {
        // Arrange
        var promoCode = new PromoCode
        {
            Code = code,
            IsPercentage = isPercentage,
            DiscountValue = discountValue,
            IsActive = true,
            ExpiresAt = null
        };

        var mockDbSet = new Mock<DbSet<PromoCode>>();
        mockDbSet
            .Setup(m => m.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<PromoCode, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(promoCode);

        _mockContext.Setup(m => m.PromoCodes).Returns(mockDbSet.Object);

        // Act
        var result = await _service.ValidateAsync(code, subtotal);

        // Assert
        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(expectedDiscount);
    }

    [Fact]
    public async Task ValidateAsync_WithExpiredCode_ShouldReturnInvalid()
    {
        // Arrange
        var promoCode = new PromoCode
        {
            Code = "EXPIRED",
            IsPercentage = true,
            DiscountValue = 10,
            IsActive = true,
            ExpiresAt = DateTime.UtcNow.AddDays(-1) // Expired yesterday
        };

        var mockDbSet = new Mock<DbSet<PromoCode>>();
        mockDbSet
            .Setup(m => m.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<PromoCode, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(promoCode);

        _mockContext.Setup(m => m.PromoCodes).Returns(mockDbSet.Object);

        // Act
        var result = await _service.ValidateAsync("EXPIRED", 100m);

        // Assert
        result.Valid.Should().BeFalse();
        result.Message.Should().Contain("expired");
    }

    [Fact]
    public async Task ValidateAsync_WithInactiveCode_ShouldReturnInvalid()
    {
        // Arrange
        var promoCode = new PromoCode
        {
            Code = "INACTIVE",
            IsPercentage = true,
            DiscountValue = 10,
            IsActive = false,
            ExpiresAt = null
        };

        var mockDbSet = new Mock<DbSet<PromoCode>>();
        mockDbSet
            .Setup(m => m.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<PromoCode, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(promoCode);

        _mockContext.Setup(m => m.PromoCodes).Returns(mockDbSet.Object);

        // Act
        var result = await _service.ValidateAsync("INACTIVE", 100m);

        // Assert
        result.Valid.Should().BeFalse();
        result.Message.Should().Contain("Invalid");
    }

    [Fact]
    public async Task ValidateAsync_WithFixedDiscountHigherThanSubtotal_ShouldCapDiscount()
    {
        // Arrange
        var promoCode = new PromoCode
        {
            Code = "FIXED500",
            IsPercentage = false,
            DiscountValue = 500m, // $500 discount
            IsActive = true,
            ExpiresAt = null
        };

        var mockDbSet = new Mock<DbSet<PromoCode>>();
        mockDbSet
            .Setup(m => m.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<PromoCode, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(promoCode);

        _mockContext.Setup(m => m.PromoCodes).Returns(mockDbSet.Object);

        var subtotal = 100m; // Only $100 subtotal

        // Act
        var result = await _service.ValidateAsync("FIXED500", subtotal);

        // Assert
        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(100m); // Should be capped at subtotal
    }
}
