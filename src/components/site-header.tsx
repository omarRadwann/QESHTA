"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CART_CHANGE_EVENT, getCartCount, readCart } from "@/lib/cart";
import { assetPath } from "@/lib/assets";
import {
  getWishlistCount,
  mergeWishlistItems,
  readWishlist,
  WISHLIST_CHANGE_EVENT,
  writeWishlist,
} from "@/lib/wishlist";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  loadRemoteWishlist,
  saveRemoteWishlist,
} from "@/lib/supabase/wishlist-sync";
import styles from "./site-header.module.css";

const primaryNav = [
  { label: "Shop", href: "/shop/" },
  { label: "About Us", href: "/#story" },
  { label: "Journal", href: "/#journal" },
];

const utilityNav = [
  { id: "language", label: "ENG", href: "/" },
  { id: "search", label: "Search", href: "/shop/#shop-search" },
  { id: "account", label: "Account", href: "/account/" },
  { id: "wishlist", label: "Wishlist", href: "/wishlist/" },
  { id: "cart", label: "Cart", href: "/cart/" },
];

type SiteHeaderProps = {
  variant?: "overlay" | "light";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
    function syncWishlistCount() {
      setWishlistCount(getWishlistCount(readWishlist()));
    }

    syncWishlistCount();
    window.addEventListener(WISHLIST_CHANGE_EVENT, syncWishlistCount);
    window.addEventListener("storage", syncWishlistCount);

    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, syncWishlistCount);
      window.removeEventListener("storage", syncWishlistCount);
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

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function syncWishlist() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) return;

        const remoteWishlist = await loadRemoteWishlist(supabase, data.session.user.id);
        const mergedWishlist = mergeWishlistItems(readWishlist(), remoteWishlist);

        if (!isMounted) return;

        writeWishlist(mergedWishlist);
        await saveRemoteWishlist(supabase, data.session.user.id, mergedWishlist);
      } catch {
        if (isMounted) setWishlistCount(getWishlistCount(readWishlist()));
      }
    }

    void syncWishlist();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void syncWishlist();
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
        ...utilityNav.slice(3),
      ]
    : utilityNav;

  return (
    <>
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

        <div className={styles.rightCluster}>
          <nav className={styles.navGroupRight} aria-label="Store navigation">
            {utilityItems.map((item) => (
              <Link key={item.id} href={item.href}>
                {item.id === "cart"
                  ? `${item.label} (${cartCount})`
                  : item.id === "wishlist"
                    ? `${item.label} (${wishlistCount})`
                    : item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        primaryNav={primaryNav}
        utilityItems={utilityItems}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  primaryNav: { label: string; href: string }[];
  utilityItems: { id: string; label: string; href: string }[];
  cartCount: number;
  wishlistCount: number;
};

function MobileMenu({
  open,
  onClose,
  primaryNav,
  utilityItems,
  cartCount,
  wishlistCount,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={styles.menuOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <button
        type="button"
        className={styles.menuClose}
        onClick={onClose}
        ref={closeRef}
        aria-label="Close menu"
      >
        Close
      </button>

      <nav className={styles.menuPrimary} aria-label="Main navigation">
        {primaryNav.map((item) => (
          <Link key={item.label} href={item.href} onClick={onClose}>
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className={styles.menuUtility} aria-label="Store navigation">
        {utilityItems.map((item) => (
          <Link key={item.id} href={item.href} onClick={onClose}>
            {item.id === "cart"
              ? `${item.label} (${cartCount})`
              : item.id === "wishlist"
                ? `${item.label} (${wishlistCount})`
                : item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
