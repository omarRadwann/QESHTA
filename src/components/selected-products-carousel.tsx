"use client";

import { useEffect, useRef, useState } from "react";
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
import styles from "./selected-products-carousel.module.css";

type SelectedProductsCarouselProps = {
  fallback: Product[];
};

export function SelectedProductsCarousel({ fallback }: SelectedProductsCarouselProps) {
  const [products, setProducts] = useState<Product[]>(fallback);
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();
    // Resolve curated rows against the full static catalog so any
    // admin-curated product keeps its real pre-rendered URL + rich data.
    const staticMap = new Map(allProducts.map((product) => [product.id, product]));

    async function syncSelected() {
      try {
        const rows = await fetchHomepageProducts(supabase, "selected");
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

    void syncSelected();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    updateEdges();
  }, [products]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  return (
    <section id="selected-products" className={styles.section} aria-label="Selected products">
      <div className={styles.header}>
        <h2>Selected products</h2>
        <div className={styles.pager} aria-label="Product carousel navigation">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="Previous products"
          >
            Prev
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="Next products"
          >
            Next
          </button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef} onScroll={updateEdges}>
        {products.map((product, index) => (
          <div className={styles.slide} key={product.id}>
            <ProductCard product={product} priority={index < 2} revealIndex={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
