using System.Net;
using System.Net.Http.Json;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Fixtures;
using FluentAssertions;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class PromoCodesControllerTests : ApiTestBase
{
    public PromoCodesControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Validate_PublicEndpoint_UsesRealService()
    {
        await Factory.UsingDbAsync(async db =>
        {
            db.PromoCodes.Add(new PromoCode { Code = "WELCOME", IsPercentage = true, DiscountValue = 20, IsActive = true });
            await db.SaveChangesAsync();
        });

        var response = await Client.PostAsJsonAsync("/api/promocodes/validate", new ValidatePromoCodeDto
        {
            Code = "welcome",
            Subtotal = 200
        });

        var result = await response.Content.ReadFromJsonAsync<ValidatePromoCodeResultDto>(CustomWebApplicationFactory.JsonOptions);
        result!.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(40m);
    }

    [Fact]
    public async Task AdminCrud_RequiresAuth()
    {
        (await Client.GetAsync("/api/promocodes")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        using var admin = await Factory.CreateAuthenticatedClientAsync();
        var created = await admin.PostAsJsonAsync("/api/promocodes", new CreatePromoCodeDto
        {
            Code = "vip",
            OwnerName = "Nada",
            IsPercentage = false,
            DiscountValue = 25,
            IsActive = true
        });
        created.StatusCode.Should().Be(HttpStatusCode.OK);
        var code = await created.Content.ReadFromJsonAsync<PromoCodeDto>(CustomWebApplicationFactory.JsonOptions);
        code!.Code.Should().Be("VIP");

        var list = await admin.GetFromJsonAsync<List<PromoCodeDto>>("/api/promocodes", CustomWebApplicationFactory.JsonOptions);
        list.Should().ContainSingle(c => c.Code == "VIP");

        var updated = await admin.PutAsJsonAsync($"/api/promocodes/{code.Id}", new CreatePromoCodeDto
        {
            Code = "VIP",
            OwnerName = "Nada",
            IsPercentage = false,
            DiscountValue = 30,
            IsActive = false
        });
        updated.StatusCode.Should().Be(HttpStatusCode.NoContent);

        (await admin.DeleteAsync($"/api/promocodes/{code.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await admin.PutAsJsonAsync($"/api/promocodes/{code.Id}", new CreatePromoCodeDto { Code = "GONE" }))
            .StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
