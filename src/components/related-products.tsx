import { ProductCard } from "@/components/product-card";
import type { Product } from "@/data/products";
import styles from "./related-products.module.css";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <div className={styles.header}>
        <h2 id="related-title">You may also like</h2>
      </div>
      <div className={styles.grid}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} revealIndex={index} />
        ))}
      </div>
    </section>
  );
}
