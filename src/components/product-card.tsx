/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  compact?: boolean;
};

export function ProductCard({
  product,
  priority = false,
  compact = false,
}: ProductCardProps) {
  return (
    <article className={compact ? styles.compactCard : styles.card}>
      <Link className={styles.imageFrame} href="#selected-products" aria-label={`View ${product.name}`}>
        <img
          src={assetPath(product.image)}
          alt={product.alt}
          loading={priority ? "eager" : "lazy"}
        />
      </Link>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </article>
  );
}
