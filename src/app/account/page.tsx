import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Account",
  description: "Access your QESHTA account, orders, and saved details.",
  alternates: {
    canonical: "/account/",
  },
};

export default function AccountPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />
      <section className={styles.panel} aria-labelledby="account-title">
        <h1 id="account-title">Account</h1>
        <form className={styles.form}>
          <label htmlFor="account-email">Email</label>
          <input id="account-email" name="email" type="email" autoComplete="email" />

          <label htmlFor="account-password">Password</label>
          <input
            id="account-password"
            name="password"
            type="password"
            autoComplete="current-password"
          />

          <button type="submit">Sign In</button>
        </form>
        <Link href="/shop/">Continue Shopping</Link>
      </section>
    </main>
  );
}
