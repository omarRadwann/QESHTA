import Link from "next/link";
import styles from "./shop-footer.module.css";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Shoes", href: "/shop/" },
      { label: "Bags", href: "/shop/" },
      { label: "Clothing", href: "/shop/" },
      { label: "New in", href: "/shop/" },
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
      { label: "Warranty & Exchange", href: "/privacy-policy/#returns" },
      { label: "FAQ", href: "/privacy-policy/#faq" },
      { label: "Payment & Delivery", href: "/privacy-policy/#orders" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "TikTok", href: "/shop/" },
      { label: "Instagram", href: "/shop/" },
      { label: "Pinterest", href: "/shop/" },
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

        <form className={styles.newsletter}>
          <h2>Newsletter</h2>
          <p>Sign up to receive news about collections, events and sales.</p>
          <label htmlFor="newsletter-email">Email</label>
          <div>
            <input id="newsletter-email" name="email" type="email" placeholder="Email" />
            <button type="submit" aria-label="Submit newsletter email">
              Go
            </button>
          </div>
        </form>
      </div>

      <p className={styles.wordmark}>QESHTA<sup>TM</sup></p>

      <div className={styles.legal}>
        <Link href="/privacy-policy/">Privacy Policy</Link>
        <Link href="/privacy-policy/#terms">Terms & Conditions</Link>
      </div>
    </footer>
  );
}
