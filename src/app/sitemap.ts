import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date("2026-05-19"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
