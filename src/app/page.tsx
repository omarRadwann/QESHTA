/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { EditorialTile } from "@/components/editorial-tile";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import {
  allProducts,
  featuredProducts,
  productSchema,
  selectedProducts,
} from "@/data/products";
import { assetPath, siteAssetUrl } from "@/lib/assets";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

export default function Home() {
  const bestSellerProducts = allProducts
    .filter((product) => product.featured || product.isNew)
    .slice(0, 4);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.siteUrl,
      logo: siteAssetUrl("/images/qeshta-logo.png"),
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Selected QESHTA products",
      itemListElement: allProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productSchema(product),
      })),
    },
  ];

  return (
    <main className={styles.shell}>
      <JsonLd data={structuredData} />
      <h1 className={styles.srOnly}>
        QESHTA clothing, leather tailoring, and sculpted womenswear
      </h1>

      <div className={styles.canvas}>
        <section className={styles.hero} aria-label="QESHTA new collection">
          <SiteHeader />
          <img
            className={styles.heroImage}
            src={assetPath("/images/hero-editorial.jpg")}
            alt="Model reclining in a burgundy velvet suit against warm walnut panels"
            width={1500}
            height={844}
            decoding="async"
            fetchPriority="high"
          />
          <div className={styles.heroCopy}>
            <p>Which sets the character the entire collection</p>
          </div>
        </section>

        <section id="collection" className={styles.editorialGrid} aria-label="Collection stories">
          <EditorialTile
            image="/images/tile-glove.jpg"
            alt="Cream leather glove with ivory knit sleeve and dark tailored trousers"
            eyebrow="A silhouette that remembers you"
            priority
          />
          <EditorialTile
            image="/images/tile-shoes.jpg"
            alt="Dark brown leather slingback heel on a quilted chocolate leather bag"
            eyebrow="Nothing loud. Everything intentional"
          />
        </section>

        <section id="story" className={styles.storyGrid} aria-label="Bold shape story">
          <div className={styles.storyImage}>
            <img
              src={assetPath("/images/tile-look-wide.jpg")}
              alt="Model in a black leather dress seated against a walnut wall"
              width={1500}
              height={750}
              decoding="async"
              loading="lazy"
            />
          </div>

          <div className={styles.storyPanel}>
            <div className={styles.featuredProducts}>
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact
                  priority={index === 0}
                />
              ))}
            </div>

            <div id="journal" className={styles.storyCopy}>
              <strong>Bold shape</strong>
              <p>
                Angela is wearing the Araz Jacket in Darkest Navy, Rond T-Shirt
                in Black Grape, Hera Pant in Cocoa and the Moon Shoes in Black.
              </p>
              <Link href="/shop/">Shop Now</Link>
            </div>
          </div>
        </section>

        <section className={styles.bestsellerBanner} aria-label="Best seller campaign">
          <img
            src={assetPath("/images/shop-editorial-banner.jpg")}
            alt="QESHTA leather styling campaign with sculpted black accessories"
            width={1600}
            height={640}
            decoding="async"
            loading="lazy"
          />
          <div>
            <p>Most wanted pieces</p>
            <h2>Soft volume, sharper finish.</h2>
          </div>
        </section>

        <section
          id="best-sellers"
          className={styles.bestSellers}
          aria-labelledby="best-sellers-title"
        >
          <div className={styles.sectionHeader}>
            <p>Best Seller</p>
            <h2 id="best-sellers-title">The pieces everyone returns to</h2>
            <Link href="/shop/">Shop Best Sellers</Link>
          </div>

          <div className={styles.productGrid}>
            {bestSellerProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        </section>

        <section id="selected-products" className={styles.selected} aria-label="Selected products">
          <div className={styles.selectedHeader}>
            <h2>Selected products</h2>
            <div className={styles.pager} aria-label="Product carousel navigation">
              <span>Prev</span>
              <span>/</span>
              <span>Next</span>
            </div>
          </div>

          <div className={styles.productGrid}>
            {selectedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        </section>

        <section
          id="newsletter"
          className={styles.newsletterPanel}
          aria-labelledby="newsletter-title"
        >
          <div>
            <p>Private list</p>
            <h2 id="newsletter-title">Collection notes, early access, and quiet sale alerts.</h2>
          </div>

          <form className={styles.newsletterForm}>
            <label htmlFor="home-newsletter-email">Email</label>
            <div>
              <input
                id="home-newsletter-email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
              <button type="submit">Join</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
