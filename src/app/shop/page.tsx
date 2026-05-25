import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ShopBanner } from "@/components/shop-banner";
import { ShopCatalog } from "@/components/shop-catalog";
import { SiteHeader } from "@/components/site-header";
import { productSchema, shopProducts } from "@/data/products";
import { siteAssetUrl } from "@/lib/assets";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Shop Spring 26 Clothing, Shoes and Accessories",
  description:
    "Shop QESHTA Spring 26: sculpted jackets, leather tailoring, dresses, shoes, bags, and jewelry in a quiet luxury edit.",
  alternates: {
    canonical: "/shop/",
  },
  openGraph: {
    title: "Shop Spring 26 Clothing, Shoes and Accessories | QESHTA",
    description:
      "Discover the QESHTA Spring 26 collection of sculpted clothing, leather pieces, shoes, bags, and jewelry.",
    url: `${siteConfig.siteUrl}/shop/`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteAssetUrl("/images/shop-editorial-banner.jpg"),
        width: 1600,
        height: 640,
        alt: "QESHTA leather styling campaign",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Spring 26 Clothing, Shoes and Accessories | QESHTA",
    description:
      "Shop the QESHTA Spring 26 edit of sculpted jackets, dresses, shoes, bags, and jewelry.",
    images: [siteAssetUrl("/images/shop-editorial-banner.jpg")],
  },
};

export default function ShopPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${siteConfig.siteUrl}/shop/`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "QESHTA Spring 26 collection",
      itemListElement: shopProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productSchema(product),
      })),
    },
  ];

  return (
    <main className={styles.page}>
      <JsonLd data={structuredData} />
      <div className={styles.surface}>
        <SiteHeader variant="light" />
        <h1 className={styles.srOnly}>
          Shop QESHTA Spring 26 clothing, shoes, and accessories
        </h1>
        <ShopBanner />
        <ShopCatalog products={shopProducts} />
      </div>
    </main>
  );
}
