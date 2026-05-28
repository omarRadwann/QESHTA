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
      { label: "Loyalty Program", href: "/account/" },
      { label: "Contact Us", href: "/privacy-policy/#contact" },
      { label: "The Journal", href: "/#journal" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Returns & Exchanges", href: "/returns-exchanges/" },
      { label: "FAQ", href: "/privacy-policy/#faq" },
      { label: "Shipping & Delivery", href: "/shipping-delivery/" },
    ],
  },
];

export function ShopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}

        <NewsletterForm
          className={styles.newsletter}
          source="footer"
          buttonLabel="Go"
          heading="Newsletter"
          description="Sign up to receive news about collections, events and sales."
        />
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
        <Link href="/privacy-policy/">Privacy Policy</Link>
        <Link href="/terms/">Terms & Conditions</Link>
      </div>
    </footer>
  );
}
