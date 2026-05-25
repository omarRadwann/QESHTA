"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { allProducts, type Product } from "@/data/products";
import {
  catalogProductToProduct,
  fetchHomepageProducts,
} from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type FeaturedProductsPanelProps = {
  className: string;
  fallback: Product[];
};

export function FeaturedProductsPanel({
  className,
  fallback,
}: FeaturedProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>(fallback);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();
    // Resolve curated rows against the full static catalog (not just this
    // panel's fallback) so any admin-curated product keeps its real
    // pre-rendered URL + rich data instead of the catalog-only route.
    const staticMap = new Map(allProducts.map((product) => [product.id, product]));

    async function syncFeatured() {
      try {
        const rows = await fetchHomepageProducts(supabase, "featured");
        if (!isMounted || rows.length === 0) return;
        setProducts(
          rows.map((row) =>
            catalogProductToProduct(row, staticMap.get(row.product_id)),
          ),
        );
      } catch {
        // Keep the static fallback when the live curation cannot load.
      }
    }

    void syncFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={className}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          compact
          priority={index === 0}
        />
      ))}
    </div>
  );
}
