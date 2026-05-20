import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your QESHTA shopping cart.",
  alternates: {
    canonical: "/cart/",
  },
};

export default function CartPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />
      <section className={styles.panel} aria-labelledby="cart-title">
        <div className={styles.headingRow}>
          <h1 id="cart-title">Cart</h1>
          <span>0 Items</span>
        </div>
        <p>Your cart is empty.</p>
        <Link href="/shop/">Continue Shopping</Link>
      </section>
    </main>
  );
}
