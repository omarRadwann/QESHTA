/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { assetPath } from "@/lib/assets";
import styles from "./shop-footer.module.css";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Coats & Jackets", href: "/shop/?category=Coats%20%26%20Jackets" },
      { label: "Dresses", href: "/shop/?category=Dresses" },
      { label: "Shoes", href: "/shop/?category=Shoes" },
      { label: "Accessories", href: "/shop/?category=Accessories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#story" },
      { label: "The Journal", href: "/#journal" },
      { label: "Loyalty Program", href: "/account/" },
      { label: "Contact Us", href: "/privacy-policy/#contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Returns & Exchanges", href: "/returns-exchanges/" },
      { label: "Shipping & Delivery", href: "/shipping-delivery/" },
      { label: "FAQ", href: "/privacy-policy/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy/" },
      { label: "Terms & Conditions", href: "/terms/" },
    ],
  },
];

export function ShopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.newsletterBand}>
        <div className={styles.newsletterIntro}>
          <p className={styles.eyebrow}>The QESHTA List</p>
          <h2>Collection notes, early access, and quiet sale alerts.</h2>
        </div>
        <NewsletterForm
          className={styles.newsletter}
          source="footer"
          buttonLabel="Subscribe"
        />
      </div>

      <div className={styles.columns}>
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <Link className={styles.wordmark} href="/" aria-label="QESHTA home">
        <img
          src={assetPath("/images/qeshta-logo.png")}
          alt="QESHTA"
          width={563}
          height={169}
        />
      </Link>

      <div className={styles.legal}>
        <span>&copy; 2026 QESHTA. Crafted in Cairo.</span>
        <span>Prices in EGP</span>
      </div>
    </footer>
  );
}
