"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { assetPath } from "@/lib/assets";
import {
  CART_CHANGE_EVENT,
  clearCart,
  getCartCount,
  getCartSubtotal,
  readCart,
  updateCartLineQuantity,
  writeCart,
  type CartLine,
} from "@/lib/cart";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  clearRemoteCart,
  loadRemoteCart,
  mergeCartLines,
  saveRemoteCart,
} from "@/lib/supabase/cart-sync";
import styles from "./cart-client.module.css";

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    function syncCart() {
      setLines(readCart());
    }

    async function syncSignedInCart(activeSession: Session) {
      try {
        const supabase = getSupabaseBrowserClient();
        const localLines = readCart();
        const remoteLines = await loadRemoteCart(supabase, activeSession.user.id);
        const mergedLines = mergeCartLines(localLines, remoteLines);

        if (!isMounted) return;

        writeCart(mergedLines);
        setLines(mergedLines);
        await saveRemoteCart(supabase, activeSession.user.id, mergedLines);

        if (isMounted && mergedLines.length > 0) {
          setSyncMessage("Cart saved to your account.");
        }
      } catch (error) {
        if (isMounted) {
          setSyncMessage(
            error instanceof Error ? error.message : "Cart sync is unavailable.",
          );
        }
      }
    }

    syncCart();
    window.addEventListener(CART_CHANGE_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();

      void supabase.auth.getSession().then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          setSyncMessage(error.message);
          return;
        }

        setSession(data.session);

        if (data.session) {
          void syncSignedInCart(data.session);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);

        if (nextSession) {
          window.setTimeout(() => {
            void syncSignedInCart(nextSession);
          }, 0);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
        window.removeEventListener(CART_CHANGE_EVENT, syncCart);
        window.removeEventListener("storage", syncCart);
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener(CART_CHANGE_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(lines), [lines]);
  const count = useMemo(() => getCartCount(lines), [lines]);

  function updateQuantity(key: string, quantity: number) {
    const nextLines = updateCartLineQuantity(key, quantity);
    setLines(nextLines);

    if (session && isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      void saveRemoteCart(supabase, session.user.id, nextLines).catch((error) => {
        setSyncMessage(error instanceof Error ? error.message : "Cart sync failed.");
      });
    }
  }

  function emptyCart() {
    clearCart();
    setLines([]);

    if (session && isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      void clearRemoteCart(supabase, session.user.id).catch((error) => {
        setSyncMessage(error instanceof Error ? error.message : "Cart sync failed.");
      });
    }
  }

  if (lines.length === 0) {
    return (
      <section className={styles.panel} aria-labelledby="cart-title">
        <div className={styles.headingRow}>
          <h1 id="cart-title">Cart</h1>
          <span>0 Items</span>
        </div>
        <p>Your cart is empty.</p>
        {syncMessage ? <p className={styles.syncMessage}>{syncMessage}</p> : null}
        <Link className={styles.emptyAction} href="/shop/">
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="cart-title">
      <div className={styles.headingRow}>
        <h1 id="cart-title">Cart</h1>
        <span>
          {count} Item{count === 1 ? "" : "s"}
        </span>
      </div>

      <div className={styles.lines}>
        {lines.map((line) => (
          <article key={line.key} className={styles.line}>
            <img
              src={assetPath(line.image)}
              alt=""
              width={160}
              height={160}
              decoding="async"
            />
            <div className={styles.lineDetails}>
              <h2>{line.name}</h2>
              <p>
                {line.variantLabel} / {line.size}
              </p>
              <p>{formatPrice(line.price)}</p>
            </div>
            <div className={styles.quantity}>
              <button
                type="button"
                aria-label={`Decrease ${line.name} quantity`}
                onClick={() => updateQuantity(line.key, line.quantity - 1)}
              >
                -
              </button>
              <span>{line.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${line.name} quantity`}
                onClick={() => updateQuantity(line.key, line.quantity + 1)}
              >
                +
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.summary}>
        <div>
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        {syncMessage ? <p className={styles.syncMessage}>{syncMessage}</p> : null}
        <Link className={styles.checkoutLink} href="/checkout/">
          Checkout
        </Link>
        <button className={styles.clearButton} type="button" onClick={emptyCart}>
          Clear Cart
        </button>
      </div>
    </section>
  );
}
