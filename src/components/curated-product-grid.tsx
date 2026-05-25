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
import styles from "./curated-product-grid.module.css";

type CuratedProductGridProps = {
  slot: string;
  fallback: Product[];
  priorityCount?: number;
};

export function CuratedProductGrid({
  slot,
  fallback,
  priorityCount = 0,
}: CuratedProductGridProps) {
  const [products, setProducts] = useState<Product[]>(fallback);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();
    // Resolve curated rows against the full static catalog so any
    // admin-curated product keeps its real pre-rendered URL + rich data.
    const staticMap = new Map(allProducts.map((product) => [product.id, product]));

    async function syncCurated() {
      try {
        const rows = await fetchHomepageProducts(supabase, slot);
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

    void syncCurated();

    return () => {
      isMounted = false;
    };
  }, [slot]);

  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          revealIndex={index}
        />
      ))}
    </div>
  );
}
