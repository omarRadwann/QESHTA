import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";
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
      <CartClient />
    </main>
  );
}
