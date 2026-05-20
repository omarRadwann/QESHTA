# QESHTA

Next.js storefront for QESHTA, a quiet luxury clothing ecommerce brand.

## Stack

- Next.js 16 App Router
- TypeScript
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
    cart-client.tsx
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
public/
  images/
    qeshta-logo.png
    hero-editorial.jpg
    tile-glove.jpg
    tile-shoes.jpg
    tile-look-wide.jpg
    product-*.jpg
```

## Development

```bash
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` before production deployment so canonical URLs and schema use the final domain.

## Deployment

The repository includes a GitHub Actions workflow that exports the app as a static Next.js site and deploys it to GitHub Pages.

Production URL:

```text
https://omarradwann.github.io/QESHTA/
```
