"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_CHANGE_EVENT, getCartCount, readCart } from "@/lib/cart";
import { assetPath } from "@/lib/assets";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import styles from "./site-header.module.css";

const primaryNav = [
  { label: "New in", href: "/shop/" },
  { label: "Shop", href: "/shop/" },
  { label: "About Us", href: "/#story" },
  { label: "Journal", href: "/#journal" },
];

const utilityNav = [
  { id: "language", label: "ENG", href: "/" },
  { id: "search", label: "Search", href: "/shop/#shop-search" },
  { id: "account", label: "Account", href: "/account/" },
  { id: "cart", label: "Cart", href: "/cart/" },
];

type SiteHeaderProps = {
  variant?: "overlay" | "light";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    function syncCartCount() {
      setCartCount(getCartCount(readCart()));
    }

    syncCartCount();
    window.addEventListener(CART_CHANGE_EVENT, syncCartCount);
    window.addEventListener("storage", syncCartCount);

    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function syncAdminLink() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          if (isMounted) setIsAdmin(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (isMounted) setIsAdmin(!profileError && profile?.role === "admin");
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    }

    void syncAdminLink();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void syncAdminLink();
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const utilityItems = isAdmin
    ? [
        ...utilityNav.slice(0, 3),
        { id: "admin", label: "Admin", href: "/admin/" },
        utilityNav[3],
      ]
    : utilityNav;

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
        {utilityItems.map((item) => (
          <Link key={item.id} href={item.href}>
            {item.id === "cart" ? `${item.label} (${cartCount})` : item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
