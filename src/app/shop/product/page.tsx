import type { Metadata } from "next";
import { Suspense } from "react";
import { DynamicProductDetail } from "@/components/dynamic-product-detail";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Product",
  description: "Shop QESHTA products from the live catalog.",
  alternates: {
    canonical: "/shop/product/",
  },
  openGraph: {
    title: "QESHTA Product",
    description: "Shop QESHTA products from the live catalog.",
    url: `${siteConfig.siteUrl}/shop/product/`,
    siteName: siteConfig.name,
  },
};

export default function DynamicProductPage() {
  return (
    <main className={styles.page}>
      <div className={styles.surface}>
        <SiteHeader variant="light" />
        <Suspense fallback={null}>
          <DynamicProductDetail />
        </Suspense>
      </div>
    </main>
  );
}
