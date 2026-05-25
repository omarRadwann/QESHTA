import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import styles from "./policy-page.module.css";

export type PolicySectionData = {
  id?: string;
  title: string;
  content: ReactNode;
};

type PolicyPageProps = {
  eyebrow?: string;
  title: string;
  updatedAt?: string;
  sections: PolicySectionData[];
};

export function PolicyPage({
  eyebrow = "Legal",
  title,
  updatedAt,
  sections,
}: PolicyPageProps) {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />

      <section className={styles.hero} aria-labelledby="policy-title">
        <p>{eyebrow}</p>
        <h1 id="policy-title">{title}</h1>
        {updatedAt ? <span>Last updated {updatedAt}</span> : null}
      </section>

      <div className={styles.content}>
        {sections.map((section) => (
          <section key={section.title} id={section.id} className={styles.section}>
            <h2>{section.title}</h2>
            <div className={styles.body}>{section.content}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
