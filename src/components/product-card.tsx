/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatPrice, getProductUrl, type Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
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
  return (
    <article
      id={product.id}
      className={compact ? styles.compactCard : styles.card}
      style={{ "--reveal-index": revealIndex } as CSSProperties}
    >
      <Link className={styles.imageFrame} href={href} aria-label={`View ${product.name}`}>
        <img
          src={assetPath(product.image)}
          alt={product.alt}
          width={900}
          height={900}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
        />
        {isSoldOut ? <span className={styles.badge}>Sold out</span> : null}
        {!isSoldOut && isLowStock ? <span className={styles.badge}>Low stock</span> : null}
      </Link>
      <h3>{product.name}</h3>
      <p>{formatPrice(displayPrice ?? product.price)}</p>
    </article>
  );
}
