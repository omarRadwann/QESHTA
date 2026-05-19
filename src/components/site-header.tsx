import Image from "next/image";
import Link from "next/link";
import styles from "./site-header.module.css";

const primaryNav = [
  { label: "New in", href: "#selected-products" },
  { label: "Shop", href: "#collection" },
  { label: "About Us", href: "#story" },
  { label: "Journal", href: "#journal" },
];

const utilityNav = [
  { label: "ENG", href: "/" },
  { label: "Search", href: "#selected-products" },
  { label: "Account", href: "#account" },
  { label: "Cart (0)", href: "#cart" },
];

export function SiteHeader() {
  return (
    <header className={styles.header} aria-label="QESHTA storefront header">
      <nav className={styles.navGroup} aria-label="Main navigation">
        {primaryNav.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className={styles.logo} href="/" aria-label="QESHTA home">
        <Image
          src="/images/qeshta-logo.png"
          alt="QESHTA"
          width={563}
          height={169}
          priority
        />
      </Link>

      <nav className={styles.navGroupRight} aria-label="Store navigation">
        {utilityNav.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
