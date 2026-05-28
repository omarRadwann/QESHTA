"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { clearCart, getCartSubtotal, readCart, type CartLine } from "@/lib/cart";
import { clearRemoteCart } from "@/lib/supabase/cart-sync";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { createOrder, type CheckoutDetails } from "@/lib/supabase/orders";
import styles from "@/app/checkout/page.module.css";

const defaultDetails: CheckoutDetails = {
  addressLine1: "",
  city: "",
  country: "Egypt",
  customerEmail: "",
  customerName: "",
  notes: "",
  phone: "",
};

export function CheckoutClient() {
  const [lines, setLines] = useState<CartLine[]>(() => readCart());
  const [session, setSession] = useState<Session | null>(null);
  const [details, setDetails] = useState<CheckoutDetails>(defaultDetails);
  const [isBooting, setIsBooting] = useState(isSupabaseConfigured());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = useMemo(() => getCartSubtotal(lines), [lines]);

  useEffect(() => {
    window.setTimeout(() => {
      setLines(readCart());
    }, 0);

    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        setMessage(error.message);
      } else {
        setSession(data.session);
        setDetails((current) => ({
          ...current,
          customerEmail: data.session?.user.email ?? "",
          customerName: data.session
            ? getSessionDisplayName(data.session) || current.customerName
            : current.customerName,
        }));
      }

      setIsBooting(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setDetails((current) => ({
        ...current,
        customerEmail: nextSession?.user.email ?? current.customerEmail,
      }));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || lines.length === 0) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const order = await createOrder(supabase, lines, details);

      // The order is committed server-side here — surface success before the
      // remote-cart cleanup so a transient cleanup failure can't make a completed
      // order look like it failed.
      clearCart();
      setLines([]);
      setOrderNumber(order.order_number);
      setMessage("Order received. The QESHTA team will confirm fulfillment.");

      try {
        await clearRemoteCart(supabase, session.user.id);
      } catch (cleanupError) {
        console.warn("Order placed, but clearing the synced cart failed.", cleanupError);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Checkout</h1>
        <p>Checkout needs Supabase keys before customer orders can be submitted.</p>
        <div className={styles.actions}>
          <Link href="/cart/">Review Cart</Link>
          <Link href="/shop/">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  if (isBooting) {
    return (
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Checkout</h1>
        <p>Loading secure account session...</p>
      </section>
    );
  }

  if (orderNumber) {
    return (
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Order {orderNumber}</h1>
        <p>{message}</p>
        <div className={styles.actions}>
          <Link href="/shop/">Continue Shopping</Link>
          <Link href="/account/">Account</Link>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Checkout</h1>
        <p>Your cart is empty.</p>
        <div className={styles.actions}>
          <Link href="/shop/">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Sign in to checkout</h1>
        <p>Customer accounts are required so every order is attached to a profile.</p>
        <div className={styles.actions}>
          <Link href="/account/">Sign In</Link>
          <Link href="/cart/">Review Cart</Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.checkoutGrid} aria-labelledby="checkout-title">
      <form className={styles.checkoutForm} onSubmit={submitOrder}>
        <div>
          <h1 id="checkout-title">Checkout</h1>
          <p>Order review and fulfillment confirmation.</p>
        </div>

        <label htmlFor="checkout-name">Full name</label>
        <input
          id="checkout-name"
          type="text"
          value={details.customerName}
          autoComplete="name"
          required
          onChange={(event) =>
            setDetails((current) => ({ ...current, customerName: event.target.value }))
          }
        />

        <label htmlFor="checkout-email">Email</label>
        <input
          id="checkout-email"
          type="email"
          value={details.customerEmail}
          autoComplete="email"
          required
          onChange={(event) =>
            setDetails((current) => ({ ...current, customerEmail: event.target.value }))
          }
        />

        <label htmlFor="checkout-phone">Phone</label>
        <input
          id="checkout-phone"
          type="tel"
          value={details.phone}
          autoComplete="tel"
          onChange={(event) =>
            setDetails((current) => ({ ...current, phone: event.target.value }))
          }
        />

        <label htmlFor="checkout-address">Address</label>
        <input
          id="checkout-address"
          type="text"
          value={details.addressLine1}
          autoComplete="street-address"
          required
          onChange={(event) =>
            setDetails((current) => ({ ...current, addressLine1: event.target.value }))
          }
        />

        <div className={styles.fieldGrid}>
          <div>
            <label htmlFor="checkout-city">City</label>
            <input
              id="checkout-city"
              type="text"
              value={details.city}
              autoComplete="address-level2"
              required
              onChange={(event) =>
                setDetails((current) => ({ ...current, city: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="checkout-country">Country</label>
            <input
              id="checkout-country"
              type="text"
              value={details.country}
              autoComplete="country-name"
              required
              onChange={(event) =>
                setDetails((current) => ({ ...current, country: event.target.value }))
              }
            />
          </div>
        </div>

        <label htmlFor="checkout-notes">Notes</label>
        <textarea
          id="checkout-notes"
          value={details.notes}
          rows={4}
          onChange={(event) =>
            setDetails((current) => ({ ...current, notes: event.target.value }))
          }
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Order"}
        </button>
        {message ? <p className={styles.statusMessage}>{message}</p> : null}
      </form>

      <aside className={styles.orderSummary} aria-label="Order summary">
        <h2>Order Summary</h2>
        <div className={styles.summaryLines}>
          {lines.map((line) => (
            <article key={line.key}>
              <img
                src={assetPath(line.image)}
                alt=""
                width={96}
                height={96}
                decoding="async"
              />
              <div>
                <h3>{line.name}</h3>
                <p>
                  {line.variantLabel} / {line.size} / Qty {line.quantity}
                </p>
                <strong>{formatPrice(line.price * line.quantity)}</strong>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.totalLine}>
          <span>Total</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
      </aside>
    </section>
  );
}

function getSessionDisplayName(activeSession: Session) {
  const metadata = activeSession.user.user_metadata;

  if (typeof metadata.full_name === "string") return metadata.full_name;
  if (typeof metadata.name === "string") return metadata.name;

  return "";
}
