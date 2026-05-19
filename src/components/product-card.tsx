/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatPrice, type Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  compact?: boolean;
  href?: string;
  revealIndex?: number;
};

export function ProductCard({
  product,
  priority = false,
  compact = false,
  href = "#selected-products",
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
      </Link>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </article>
  );
}
