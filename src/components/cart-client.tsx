"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
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
  type CartLine,
} from "@/lib/cart";
import styles from "./cart-client.module.css";

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    function syncCart() {
      setLines(readCart());
    }

    syncCart();
    window.addEventListener(CART_CHANGE_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(lines), [lines]);
  const count = useMemo(() => getCartCount(lines), [lines]);

  function updateQuantity(key: string, quantity: number) {
    setLines(updateCartLineQuantity(key, quantity));
  }

  function emptyCart() {
    clearCart();
    setLines([]);
  }

  if (lines.length === 0) {
    return (
      <section className={styles.panel} aria-labelledby="cart-title">
        <div className={styles.headingRow}>
          <h1 id="cart-title">Cart</h1>
          <span>0 Items</span>
        </div>
        <p>Your cart is empty.</p>
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
              <p>${formatPrice(line.price)}</p>
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
          <strong>${formatPrice(subtotal)}</strong>
        </div>
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
