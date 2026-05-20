import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin",
  description: "Protected QESHTA back office for orders, customers, and product operations.",
  alternates: {
    canonical: "/admin/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />
      <AdminDashboard />
    </main>
  );
}
