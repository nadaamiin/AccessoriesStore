---
name: testing-accessories-store
description: How to stand up the AccessoriesStore API (.NET 10 + SQL Server), storefront and admin Vite apps locally to test end-to-end flows such as checkout, promo codes and orders.
---

# Running AccessoriesStore locally for end-to-end testing

## Backend (AccessoriesStore.Api, net10.0)
- The dotnet 10 SDK may not be on PATH. Use `export DOTNET_ROOT=/home/ubuntu/.dotnet PATH=$PATH:/home/ubuntu/.dotnet:/home/ubuntu/.dotnet/tools`.
  Without `DOTNET_ROOT`, global tools such as `dotnet-ef` fail with "Download the .NET runtime".
- `appsettings.json` points at `Server=.;` (Windows LocalDB style) and there is no local SQL Server. Start one in docker instead of changing committed config:
  ```bash
  docker run -d --name mssql -e ACCEPT_EULA=Y -e "MSSQL_SA_PASSWORD=Str0ng!Passw0rd" \
    -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
  ```
  Then override config with environment variables (never commit a provider swap):
  ```bash
  export ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=AccessoriesStoreDb;User Id=sa;Password=Str0ng!Passw0rd;TrustServerCertificate=True;"
  export Jwt__Key="0123456789abcdef0123456789abcdef0123"   # appsettings ships an empty key; API won't boot without one
  export ASPNETCORE_ENVIRONMENT=Development
  ```
- Apply schema: `dotnet tool install --global dotnet-ef` then `dotnet ef database update` from `AccessoriesStore.Api`.
- There is no seed data. Insert rows directly with sqlcmd inside the container, e.g.:
  `docker exec mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Str0ng!Passw0rd' -C -d AccessoriesStoreDb -Q "..."`
  Minimum for checkout: a row in `Categories`, one or more active `Products` with stock, one row in `ShippingSettings`
  (ShippingFee/FreeShippingThreshold), and `PromoCodes` rows (`Code` must be UPPERCASE; validation upper-cases input).
- Run: `dotnet run --launch-profile https` → https://localhost:7113 (+ http://localhost:5143).
  `UseHttpsRedirection` means plain-HTTP POSTs return 307; use the https URL with `curl -k`.
- Brevo email is unconfigured (empty API key); order-confirmation email failures are caught and logged, so orders still succeed.

## HTTPS dev cert for the browser
The frontends hardcode `https://localhost:7113` in `src/api/client.js`, so Chrome must trust the ASP.NET dev cert:
```bash
dotnet dev-certs https --trust            # partial on Linux, still needed
sudo apt-get install -y libnss3-tools
dotnet dev-certs https -ep /tmp/devcert.crt --format PEM
certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n aspnet-dev -i /tmp/devcert.crt
```
Restart Chrome afterwards; storefront API calls then succeed without an interstitial.

## Frontends (accessories-store-web, accessories-store-admin)
- Vite 8 uses rolldown, whose native binding is NOT installed under Node 20 → `npm run dev` crashes with
  "Cannot find native binding". Use Node 22 and reinstall:
  ```bash
  . "$HOME/.nvm/nvm.sh" && nvm use 22
  rm -rf node_modules package-lock.json && npm install && npm run dev
  ```
  (Restore `package-lock.json` with `git checkout --` afterwards so the tree stays clean.)
- Vite picks 5173 or 5174; the API CORS policy allows both.

## Useful checkout facts
- Storefront checkout: Products page → cart icon on a product card → "Check Out" in the drawer → `/checkout`.
- Promo field is "Discount code or gift card" + Apply → POST `/api/promocodes/validate`; Place Order → POST `/api/orders`.
- Verify server-side truth (not just client rendering) with:
  `SELECT TOP 5 OrderNumber, PromoCode, DiscountAmount, ShippingFee, TotalAmount FROM Orders ORDER BY Id DESC`.

## Devin Secrets Needed
None — all credentials above are local throwaway values.
