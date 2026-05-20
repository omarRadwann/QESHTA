import type { Metadata } from "next";
import { AccountClient } from "@/components/account-client";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Account",
  description: "Access your QESHTA account, orders, and saved details.",
  alternates: {
    canonical: "/account/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />
      <AccountClient />
    </main>
  );
}
