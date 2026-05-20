import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your QESHTA order.",
  alternates: {
    canonical: "/checkout/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />
      <section className={styles.panel} aria-labelledby="checkout-title">
        <h1 id="checkout-title">Checkout</h1>
        <p>
          Secure checkout will be connected when the store backend is ready. Your cart
          selections are saved in this browser.
        </p>
        <div className={styles.actions}>
          <Link href="/cart/">Review Cart</Link>
          <Link href="/shop/">Continue Shopping</Link>
        </div>
      </section>
    </main>
  );
}
