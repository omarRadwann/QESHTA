import Link from "next/link";
import styles from "./shop-footer.module.css";

const footerGroups = [
  {
    title: "Shop",
    links: ["Shoes", "Bags", "Clothing", "New in"],
  },
  {
    title: "Company",
    links: ["About Us", "Loyalty Program", "Contact Us", "The Journal"],
  },
  {
    title: "Support",
    links: ["Warranty & Exchange", "FAQ", "Payment & Delivery"],
  },
  {
    title: "Social",
    links: ["TikTok", "Instagram", "Pinterest"],
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
              <Link key={link} href="/shop/">
                {link}
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
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Terms & Conditions</Link>
      </div>
    </footer>
  );
}
