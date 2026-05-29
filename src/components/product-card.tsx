"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { WishlistButton } from "@/components/wishlist-button";
import { formatPrice, getProductUrl, type Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { colorToHex, productTint } from "@/lib/colors";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  compact?: boolean;
  displayPrice?: number;
  href?: string;
  isLowStock?: boolean;
  isSoldOut?: boolean;
  revealIndex?: number;
};

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.5 8h11l-.9 11.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8z" />
      <path d="M9 8V6.6a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

function buildSwatches(product: Product): string[] {
  const variants = product.variants ?? [];
  if (variants.length < 2) return [];
  const seen = new Set<string>();
  const swatches: string[] = [];
  for (const variant of variants) {
    const hex = colorToHex(variant.color);
    if (hex && !seen.has(hex)) {
      seen.add(hex);
      swatches.push(hex);
    }
  }
  return swatches;
}

export function ProductCard({
  product,
  priority = false,
  compact = false,
  displayPrice,
  href = getProductUrl(product),
  isLowStock = false,
  isSoldOut = false,
  revealIndex = 0,
}: ProductCardProps) {
  const tint = productTint(product.colorHex, product.color);
  const cardStyle = {
    "--reveal-index": revealIndex,
    ...(tint ? { "--card-tint": tint } : {}),
  } as CSSProperties;
  const swatches = buildSwatches(product);

  return (
    <article
      id={product.id}
      className={compact ? styles.compactCard : styles.card}
      style={cardStyle}
    >
      <div className={styles.imageShell}>
        <Link className={styles.imageFrame} href={href} aria-label={`View ${product.name}`}>
          <img
            src={assetPath(product.image)}
            alt={product.alt}
            width={900}
            height={1200}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
          />
          {isSoldOut ? <span className={styles.badge}>Sold out</span> : null}
          {!isSoldOut && isLowStock ? <span className={styles.badge}>Low stock</span> : null}
        </Link>

        <div className={styles.actions}>
          <Link
            className={styles.actionButton}
            href={href}
            aria-label={`View ${product.name} to add to cart`}
          >
            <BagIcon />
          </Link>
          <WishlistButton
            productId={product.id}
            className={styles.actionButton}
            icon
            inactiveLabel="Save to wishlist"
            activeLabel="Saved to wishlist"
          />
        </div>
      </div>

      <div className={styles.caption}>
        <div className={styles.info}>
          <h3>{product.name}</h3>
          <p>{formatPrice(displayPrice ?? product.price)}</p>
        </div>
        {swatches.length > 0 ? (
          <div className={styles.swatches} aria-hidden="true">
            {swatches.slice(0, 4).map((hex) => (
              <span key={hex} style={{ backgroundColor: hex }} />
            ))}
            {swatches.length > 4 ? (
              <span className={styles.swatchMore}>+{swatches.length - 4}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
