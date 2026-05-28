import type { MetadataRoute } from "next";
import { allProducts, getProductUrl } from "@/data/products";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-23");

  return [
    {
      url: `${siteConfig.siteUrl}/`,
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
    {
      url: `${siteConfig.siteUrl}/privacy-policy/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.siteUrl}/terms/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.siteUrl}/shipping-delivery/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.siteUrl}/returns-exchanges/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...allProducts.map((product) => ({
      url: `${siteConfig.siteUrl}${getProductUrl(product)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
