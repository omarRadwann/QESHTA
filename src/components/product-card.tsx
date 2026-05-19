import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
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
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes={compact ? "(max-width: 760px) 50vw, 248px" : "(max-width: 760px) 50vw, 258px"}
          priority={priority}
        />
      </Link>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </article>
  );
}
