using System.Net;
using System.Net.Http.Json;
using AccessoriesStore.Api.DTOs;
using AccessoriesStore.Domain.Entities;
using AccessoriesStore.Tests.Integration.Fixtures;
using FluentAssertions;

namespace AccessoriesStore.Tests.Integration.Controllers;

public class AuthControllerTests : ApiTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_ThenLogin_ReturnsToken()
    {
        var register = await Client.PostAsJsonAsync("/api/auth/register", new RegisterAdminDto
        {
            FullName = "Nada",
            Email = "nada@store.test",
            Password = "Password1!"
        });

        register.StatusCode.Should().Be(HttpStatusCode.OK);
        var registered = await register.Content.ReadFromJsonAsync<AuthResponseDto>(CustomWebApplicationFactory.JsonOptions);
        registered!.Token.Should().NotBeNullOrWhiteSpace();
        registered.Email.Should().Be("nada@store.test");

        var login = await Client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = "nada@store.test",
            Password = "Password1!"
        });

        login.StatusCode.Should().Be(HttpStatusCode.OK);
        var loggedIn = await login.Content.ReadFromJsonAsync<AuthResponseDto>(CustomWebApplicationFactory.JsonOptions);
        loggedIn!.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        var dto = new RegisterAdminDto { FullName = "Admin", Email = "dup@store.test", Password = "Password1!" };
        (await Client.PostAsJsonAsync("/api/auth/register", dto)).EnsureSuccessStatusCode();

        var second = await Client.PostAsJsonAsync("/api/auth/register", dto);

        second.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        await Client.PostAsJsonAsync("/api/auth/register", new RegisterAdminDto
        {
            FullName = "Admin",
            Email = "login@store.test",
            Password = "Password1!"
        });

        var login = await Client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = "login@store.test",
            Password = "WrongPass1!"
        });

        login.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_WithoutToken_ReturnsUnauthorized()
    {
        var response = await Client.GetAsync("/api/auth/me");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_WithToken_ReturnsCurrentAdmin()
    {
        using var client = await Factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("store.test");
    }
}
