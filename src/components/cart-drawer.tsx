"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CART_CHANGE_EVENT,
  CART_DRAWER_OPEN,
  getCartCount,
  getCartSubtotal,
  readCart,
  updateCartLineQuantity,
  type CartLine,
} from "@/lib/cart";
import {
  formatPrice,
  getProductById,
  getProductUrl,
  getRelatedProducts,
  type Product,
} from "@/data/products";
import { assetPath } from "@/lib/assets";
import styles from "./cart-drawer.module.css";

const FREE_SHIPPING_THRESHOLD = 2500; // EGP

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  // Lazy init reads localStorage on mount; the drawer renders null until opened,
  // so the server ([]) vs client (stored) difference never hits the DOM.
  const [lines, setLines] = useState<CartLine[]>(readCart);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(() => setLines(readCart()), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onChange() {
      refresh();
    }
    function onOpen() {
      refresh();
      setOpen(true);
    }
    window.addEventListener(CART_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener(CART_DRAWER_OPEN, onOpen);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CART_DRAWER_OPEN, onOpen);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const count = getCartCount(lines);
  const subtotal = getCartSubtotal(lines);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const recBase: Product | undefined =
    lines.length > 0 ? getProductById(lines[lines.length - 1].productId) : undefined;
  const recs = recBase ? getRelatedProducts(recBase, 4) : [];

  return (
    <div className={styles.root}>
      <button type="button" className={styles.scrim} aria-label="Close bag" onClick={close} />
      <aside
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <header className={styles.head}>
          <h2>{count > 0 ? "Just Added" : "Your Bag"}</h2>
          <button
            type="button"
            className={styles.close}
            ref={closeRef}
            onClick={close}
            aria-label="Close bag"
          >
            Close
          </button>
        </header>

        {count > 0 ? (
          <div className={styles.shipping}>
            <p>
              {remaining > 0
                ? `You're ${formatPrice(remaining)} away from free shipping.`
                : "You've unlocked free shipping."}
            </p>
            <div className={styles.progress} aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <div className={styles.body}>
          {count === 0 ? (
            <div className={styles.empty}>
              <p>Your bag is empty.</p>
              <Link href="/shop/" onClick={close}>
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className={styles.lines}>
              {lines.map((line) => (
                <li key={line.key} className={styles.line}>
                  <img
                    src={assetPath(line.image)}
                    alt=""
                    width={120}
                    height={160}
                    loading="lazy"
                  />
                  <div className={styles.lineInfo}>
                    <div className={styles.lineTop}>
                      <h3>{line.name}</h3>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => updateCartLineQuantity(line.key, 0)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className={styles.variant}>
                      {line.variantLabel} / {line.size}
                    </p>
                    <div className={styles.lineBottom}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name} quantity`}
                          onClick={() => updateCartLineQuantity(line.key, line.quantity - 1)}
                        >
                          &minus;
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name} quantity`}
                          onClick={() => updateCartLineQuantity(line.key, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.linePrice}>
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {recs.length > 0 ? (
            <section className={styles.recs} aria-label="You may also like">
              <h3>You may also like</h3>
              <div className={styles.recGrid}>
                {recs.map((product) => (
                  <Link
                    key={product.id}
                    href={getProductUrl(product)}
                    className={styles.recCard}
                    onClick={close}
                  >
                    <img
                      src={assetPath(product.image)}
                      alt={product.alt}
                      width={300}
                      height={400}
                      loading="lazy"
                    />
                    <span className={styles.recName}>{product.name}</span>
                    <span className={styles.recPrice}>{formatPrice(product.price)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {count > 0 ? (
          <footer className={styles.foot}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <Link href="/checkout/" className={styles.checkout} onClick={close}>
              Checkout
            </Link>
            <Link href="/cart/" className={styles.viewCart} onClick={close}>
              View shopping bag
            </Link>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
