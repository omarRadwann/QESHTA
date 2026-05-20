import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
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
      <CheckoutClient />
    </main>
  );
}
