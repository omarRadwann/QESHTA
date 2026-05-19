/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  compact?: boolean;
  href?: string;
};

export function ProductCard({
  product,
  priority = false,
  compact = false,
  href = "#selected-products",
}: ProductCardProps) {
  return (
    <article id={product.id} className={compact ? styles.compactCard : styles.card}>
      <Link className={styles.imageFrame} href={href} aria-label={`View ${product.name}`}>
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
