using AccessoriesStore.Api.Services;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Unit.Helpers;
using FluentAssertions;

namespace AccessoriesStore.Tests.Unit.Services;

public class PromoCodeServiceTests : IAsyncLifetime
{
    private SqliteDbContextFactory _db = null!;

    public async Task InitializeAsync() => _db = await SqliteDbContextFactory.CreateAsync();

    public async Task DisposeAsync() => await _db.DisposeAsync();

    [Fact]
    public async Task ValidateAsync_WithNullOrWhitespace_ReturnsInvalid()
    {
        await using var context = _db.CreateContext();
        var service = new PromoCodeService(context);

        var empty = await service.ValidateAsync("   ", 100m);
        var missing = await service.ValidateAsync(null, 100m);

        empty.Valid.Should().BeFalse();
        empty.DiscountAmount.Should().Be(0);
        empty.Message.Should().Be("Enter a code.");
        missing.Valid.Should().BeFalse();
        missing.Message.Should().Be("Enter a code.");
    }

    [Fact]
    public async Task ValidateAsync_WithUnknownCode_ReturnsInvalid()
    {
        await using var context = _db.CreateContext();
        var service = new PromoCodeService(context);

        var result = await service.ValidateAsync("NOPE", 100m);

        result.Valid.Should().BeFalse();
        result.Message.Should().Be("Invalid promo code.");
    }

    [Fact]
    public async Task ValidateAsync_WithInactiveCode_ReturnsInvalid()
    {
        await SeedCode(new PromoCode { Code = "OFF", IsActive = false, IsPercentage = true, DiscountValue = 10 });

        await using var context = _db.CreateContext();
        var result = await new PromoCodeService(context).ValidateAsync("off", 100m);

        result.Valid.Should().BeFalse();
        result.Message.Should().Be("Invalid promo code.");
    }

    [Fact]
    public async Task ValidateAsync_WithExpiredCode_ReturnsInvalid()
    {
        await SeedCode(new PromoCode
        {
            Code = "OLD",
            IsActive = true,
            IsPercentage = true,
            DiscountValue = 10,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1)
        });

        await using var context = _db.CreateContext();
        var result = await new PromoCodeService(context).ValidateAsync("OLD", 100m);

        result.Valid.Should().BeFalse();
        result.Message.Should().Be("This code has expired.");
    }

    [Fact]
    public async Task ValidateAsync_WithPercentageCode_RoundsDiscountToTwoPlaces()
    {
        await SeedCode(new PromoCode { Code = "PCT", IsActive = true, IsPercentage = true, DiscountValue = 15 });

        await using var context = _db.CreateContext();
        var result = await new PromoCodeService(context).ValidateAsync(" pct ", 99.99m);

        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(15.00m);
        result.Message.Should().Be("15% off applied!");
    }

    [Fact]
    public async Task ValidateAsync_WithFixedDiscountHigherThanSubtotal_CapsAtSubtotal()
    {
        await SeedCode(new PromoCode { Code = "BIG", IsActive = true, IsPercentage = false, DiscountValue = 500 });

        await using var context = _db.CreateContext();
        var result = await new PromoCodeService(context).ValidateAsync("BIG", 80m);

        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(80m);
        result.Message.Should().Be("LE 500 off applied!");
    }

    [Fact]
    public async Task ValidateAsync_NormalizesCodeToUppercase()
    {
        await SeedCode(new PromoCode { Code = "SAVE10", IsActive = true, IsPercentage = false, DiscountValue = 10 });

        await using var context = _db.CreateContext();
        var result = await new PromoCodeService(context).ValidateAsync("save10", 50m);

        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(10m);
    }

    private async Task SeedCode(PromoCode code)
    {
        await using var context = _db.CreateContext();
        context.PromoCodes.Add(code);
        await context.SaveChangesAsync();
    }
}
