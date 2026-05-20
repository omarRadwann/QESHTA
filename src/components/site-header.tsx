/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { assetPath } from "@/lib/assets";
import styles from "./site-header.module.css";

const primaryNav = [
  { label: "New in", href: "/shop" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/#story" },
  { label: "Journal", href: "/#journal" },
];

const utilityNav = [
  { label: "ENG", href: "/" },
  { label: "Search", href: "/shop#shop-search" },
  { label: "Account", href: "/account/" },
  { label: "Cart (0)", href: "/cart/" },
];

type SiteHeaderProps = {
  variant?: "overlay" | "light";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  return (
    <header
      className={`${styles.header} ${variant === "light" ? styles.light : ""}`}
      aria-label="QESHTA storefront header"
    >
      <nav className={styles.navGroup} aria-label="Main navigation">
        {primaryNav.map((item) => (
          <Link key={item.label} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className={styles.logo} href="/" aria-label="QESHTA home">
        <img
          src={assetPath("/images/qeshta-logo.png")}
          alt="QESHTA"
          width={563}
          height={169}
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
