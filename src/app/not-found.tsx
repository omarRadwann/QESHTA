import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />

      <section className={styles.hero} aria-labelledby="not-found-title">
        <p className={styles.eyebrow}>Error 404</p>
        <h1 id="not-found-title" className={styles.title}>
          This page has slipped out of the collection.
        </h1>
        <p className={styles.copy}>
          The page you were looking for has moved or no longer exists. Find your
          way back below.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Return Home
          </Link>
          <Link className={styles.secondary} href="/shop/">
            Browse the Shop
          </Link>
        </div>
      </section>
    </main>
  );
}
