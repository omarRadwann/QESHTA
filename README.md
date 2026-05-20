# QESHTA

Next.js storefront for QESHTA, a quiet luxury clothing ecommerce brand.

## Stack

- Next.js 16 App Router
- TypeScript
- Supabase Auth and Postgres profiles
- Supabase-backed saved carts and order capture
- Tailwind CSS 4 available, with custom CSS modules for the homepage art direction
- SEO-ready metadata, robots, sitemap, Open Graph, Twitter cards, and JSON-LD product data

## Project Structure

```text
src/
  app/
    account/
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
- Saved carts and cart line items
- Customer orders and order line items
- RLS policies so authenticated customers can only read/write their own records

To create a confirmed demo account from your local machine:

```bash
$env:NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
$env:SUPABASE_DEMO_EMAIL="customer@qeshta.com"
$env:SUPABASE_DEMO_PASSWORD="change-this-password"
npm run supabase:create-demo-user
```

## Deployment

The repository includes a GitHub Actions workflow that exports the app as a static Next.js site and deploys it to GitHub Pages.

Production URL:

```text
https://omarradwann.github.io/QESHTA/
```
