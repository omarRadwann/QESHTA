import type { Metadata } from "next";
import { ShopFooter } from "@/components/shop-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistClient } from "@/components/wishlist-client";
import { siteAssetUrl } from "@/lib/assets";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Review your saved QESHTA pieces and return to the sculpted clothing, leather, shoes, and accessories you love.",
  alternates: {
    canonical: "/wishlist/",
  },
  openGraph: {
    title: "Wishlist | QESHTA",
    description:
      "Review saved QESHTA clothing, leather pieces, shoes, bags, and jewelry.",
    url: `${siteConfig.siteUrl}/wishlist/`,
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
    title: "Wishlist | QESHTA",
    description: "Review your saved QESHTA pieces.",
    images: [siteAssetUrl("/images/shop-editorial-banner.jpg")],
  },
};

export default function WishlistPage() {
  return (
    <main className={styles.page}>
      <div className={styles.surface}>
        <SiteHeader variant="light" />
        <WishlistClient />
        <ShopFooter />
      </div>
    </main>
  );
}
