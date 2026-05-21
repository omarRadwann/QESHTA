# QESHTA

Next.js storefront for QESHTA, a quiet luxury clothing ecommerce brand.

## Stack

- Next.js 16 App Router
- TypeScript
- Supabase Auth, customer profiles, and admin roles
- Email/password and Google OAuth account sign-in
- Supabase-backed saved carts and order capture
- Protected admin dashboard for orders, customers, pricing, and inventory operations
- Tailwind CSS 4 available, with custom CSS modules for the homepage art direction
- SEO-ready metadata, robots, sitemap, Open Graph, Twitter cards, and JSON-LD product data

## Project Structure

```text
src/
  app/
    account/
    admin/
    cart/
    checkout/
    shop/
    globals.css
    layout.tsx
    page.tsx
    page.module.css
    robots.ts
    sitemap.ts
  components/
    account-client.tsx
    admin-dashboard.tsx
    cart-client.tsx
    checkout-client.tsx
    editorial-tile.tsx
    json-ld.tsx
    product-card.tsx
    product-detail.tsx
    shop-catalog.tsx
    shop-footer.tsx
    site-header.tsx
  data/
    products.ts
  lib/
    assets.ts
    cart.ts
    site.ts
    supabase/
      cart-sync.ts
      client.ts
      catalog.ts
      admin.ts
      orders.ts
      types.ts
public/
  images/
    qeshta-logo.png
    hero-editorial.jpg
    tile-glove.jpg
    tile-shoes.jpg
    tile-look-wide.jpg
    product-*.jpg
supabase/
  schema.sql
scripts/
  create-admin-user.mjs
  create-demo-user.mjs
```

## Development

```bash
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` before production deployment so canonical URLs and schema use the final domain.

## Supabase

Create a Supabase project, run `supabase/schema.sql` in the SQL editor, then set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

For GitHub Pages, add those as repository variables or secrets in the Actions environment.
Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client builds.

The schema creates:

- Customer profiles keyed to `auth.users`
- Customer-facing account order history
- Admin/customer account roles with guarded role updates
- Catalog product pricing, inventory, and merchandising controls
- Saved carts and cart line items
- Customer orders and order line items
- RLS policies so customers only access their own records and admins can manage back-office data
- Public read access only for active catalog product availability, so the static storefront can hide inactive products and block sold-out items
- Atomic order creation that validates active products, uses server-side prices, and decrements stock

### Google sign-in

The account page supports a `Continue with Google` button that uses Supabase OAuth.
It appears automatically when the Supabase Google provider is enabled. To make it
live for customers, configure the external OAuth provider outside the repository:

1. In Google Cloud Console, create an OAuth web client.
2. Add this authorized redirect URI:

```text
https://epujieswopwpgvxvbwir.supabase.co/auth/v1/callback
```

3. In Supabase Dashboard > Authentication > Providers > Google, enable Google and
   add the Google client ID and client secret.
4. In Supabase Dashboard > Authentication > URL Configuration, set the Site URL and
   Redirect URLs:

```text
https://omarradwann.github.io/QESHTA
https://omarradwann.github.io/QESHTA/account/
http://localhost:3000/account/
```

Google client secrets must stay in Supabase/Google, never in `NEXT_PUBLIC_*`
variables or repository files.

To create a confirmed customer account from your local machine:

```bash
$env:NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
$env:SUPABASE_DEMO_EMAIL="customer@qeshta.com"
$env:SUPABASE_DEMO_PASSWORD="change-this-password"
npm run supabase:create-demo-user
```

To create or update an admin account:

```bash
$env:NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
$env:SUPABASE_ADMIN_EMAIL="admin@qeshta.com"
$env:SUPABASE_ADMIN_PASSWORD="change-this-password"
npm run supabase:create-admin-user
```

Admin URL:

```text
/admin/
```

Production credentials should be rotated before client handoff and managed outside the repository.

## Deployment

The repository includes a GitHub Actions workflow that exports the app as a static Next.js site and deploys it to GitHub Pages.

Production URL:

```text
https://omarradwann.github.io/QESHTA/
```
