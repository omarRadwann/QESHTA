"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { allProducts, getProductUrl, type Product } from "@/data/products";
import {
  catalogProductToProduct,
  fetchPublicCatalogProducts,
} from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  clearWishlist,
  mergeWishlistItems,
  readWishlist,
  WISHLIST_CHANGE_EVENT,
  writeWishlist,
  type WishlistItem,
} from "@/lib/wishlist";
import {
  loadRemoteWishlist,
  saveRemoteWishlist,
} from "@/lib/supabase/wishlist-sync";
import styles from "./wishlist-client.module.css";

const fallbackProducts = new Map(allProducts.map((product) => [product.id, product]));

export function WishlistClient() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>(allProducts);
  const [state, setState] = useState<"ready" | "loading" | "error">(
    isSupabaseConfigured() ? "loading" : "ready",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    function syncLocalWishlist() {
      setWishlistItems(readWishlist());
    }

    syncLocalWishlist();
    window.addEventListener(WISHLIST_CHANGE_EVENT, syncLocalWishlist);
    window.addEventListener("storage", syncLocalWishlist);

    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, syncLocalWishlist);
      window.removeEventListener("storage", syncLocalWishlist);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function hydrateWishlist() {
      try {
        const { data } = await supabase.auth.getSession();
        const catalogProducts = await fetchPublicCatalogProducts(supabase);
        const nextProducts = catalogProducts.map((product) =>
          catalogProductToProduct(product, fallbackProducts.get(product.product_id)),
        );

        if (!isMounted) return;

        setLiveProducts([...allProducts, ...nextProducts]);

        if (data.session) {
          const remoteWishlist = await loadRemoteWishlist(supabase, data.session.user.id);
          const mergedWishlist = mergeWishlistItems(readWishlist(), remoteWishlist);

          if (!isMounted) return;

          writeWishlist(mergedWishlist);
          await saveRemoteWishlist(supabase, data.session.user.id, mergedWishlist);
        }

        if (isMounted) {
          setState("ready");
          setMessage("");
        }
      } catch {
        if (isMounted) {
          setState("error");
          setMessage("Wishlist is saved on this device. Sign in again to sync it.");
        }
      }
    }

    void hydrateWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const products = useMemo(() => {
    const productMap = new Map<string, Product>();
    allProducts.forEach((product) => productMap.set(product.id, product));
    liveProducts.forEach((product) => productMap.set(product.id, product));

    return wishlistItems
      .map((item) => productMap.get(item.productId))
      .filter((product): product is Product => Boolean(product));
  }, [liveProducts, wishlistItems]);

  async function handleClearWishlist() {
    clearWishlist();

    if (!isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        await saveRemoteWishlist(supabase, data.session.user.id, []);
      }
    } catch {
      setMessage("Wishlist cleared locally. Sign in again to sync it.");
    }
  }

  return (
    <section className={styles.wishlist} aria-labelledby="wishlist-heading">
      <div className={styles.headingRow}>
        <div>
          <p>Saved pieces</p>
          <h1 id="wishlist-heading">Wishlist</h1>
        </div>
        {wishlistItems.length > 0 ? (
          <button type="button" onClick={handleClearWishlist}>
            Clear Wishlist
          </button>
        ) : null}
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              href={getProductUrl(product)}
              priority={index < 4}
              revealIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>
            {state === "loading"
              ? "Loading wishlist."
              : "Your wishlist is ready for the pieces you want to revisit."}
          </p>
          <Link href="/shop/">Continue Shopping</Link>
        </div>
      )}
    </section>
  );
}
