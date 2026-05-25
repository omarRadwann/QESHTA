"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { assetPath } from "@/lib/assets";
import { fetchBannersBySlot } from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import styles from "./shop-banner.module.css";

type BannerContent = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
};

const defaultBanner: BannerContent = {
  eyebrow: "Spring 26 Edit",
  title: "Sculpted leather, quiet luxury",
  subtitle:
    "Discover the pieces defining the season — tailored, textural, and made to be lived in.",
  image_url: "/images/shop-editorial-banner.jpg",
  cta_label: "Explore the collection",
  cta_href: "/shop/",
};

export function ShopBanner() {
  const [banner, setBanner] = useState<BannerContent>(defaultBanner);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function syncBanner() {
      try {
        const banners = await fetchBannersBySlot(supabase, "shop_top");
        if (isMounted && banners.length > 0) setBanner(banners[0]);
      } catch {
        // Keep the default banner when the live content cannot load.
      }
    }

    void syncBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasContent = banner.title || banner.subtitle || banner.image_url;
  if (!hasContent) return null;

  return (
    <section className={styles.banner} aria-label="Shop highlight">
      {banner.image_url ? (
        <img
          src={assetPath(banner.image_url)}
          alt=""
          width={1600}
          height={520}
          decoding="async"
        />
      ) : null}
      <div className={styles.copy}>
        {banner.eyebrow ? <p className={styles.eyebrow}>{banner.eyebrow}</p> : null}
        {banner.title ? <h2>{banner.title}</h2> : null}
        {banner.subtitle ? <p className={styles.sub}>{banner.subtitle}</p> : null}
        {banner.cta_label && banner.cta_href ? (
          <Link className={styles.cta} href={banner.cta_href}>
            {banner.cta_label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
