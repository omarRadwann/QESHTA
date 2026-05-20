import type { MetadataRoute } from "next";
import { allProducts, getProductUrl } from "@/data/products";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-20");

  return [
    {
      url: siteConfig.siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/shop/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...allProducts.map((product) => ({
      url: `${siteConfig.siteUrl}${getProductUrl(product)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
