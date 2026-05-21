"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductDetail } from "@/components/product-detail";
import type { Product } from "@/data/products";
import {
  catalogProductToProduct,
  fetchCatalogProductById,
} from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import styles from "./dynamic-product-detail.module.css";

export function DynamicProductDetail() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id")?.trim() ?? "";
  const isMissingInput = !productId || !isSupabaseConfigured();
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    isMissingInput ? "missing" : "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isMissingInput) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function loadProduct() {
      setState("loading");
      setMessage("");

      try {
        const catalogProduct = await fetchCatalogProductById(supabase, productId);

        if (!isMounted) return;

        if (!catalogProduct || catalogProduct.status !== "active") {
          setProduct(null);
          setState("missing");
          return;
        }

        setProduct(catalogProductToProduct(catalogProduct));
        setState("ready");
      } catch (error) {
        if (!isMounted) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Product could not load.");
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [isMissingInput, productId]);

  if (!isMissingInput && state === "ready" && product) {
    return <ProductDetail product={product} />;
  }

  const renderedState = isMissingInput ? "missing" : state;

  return (
    <section className={styles.state} aria-labelledby="dynamic-product-title">
      <p>QESHTA product</p>
      <h1 id="dynamic-product-title">
        {renderedState === "loading" ? "Loading product" : "Product unavailable"}
      </h1>
      <span>
        {renderedState === "error"
          ? message
          : "This product is not active online or the link is incomplete."}
      </span>
      <Link href="/shop/">Back to Shop</Link>
    </section>
  );
}
