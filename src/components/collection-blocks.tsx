/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { assetPath } from "@/lib/assets";
import styles from "./collection-blocks.module.css";

type Block = {
  label: string;
  href: string;
  image: string;
  alt: string;
};

// NOTE: the MEN image is a placeholder editorial shot — swap for a real menswear
// campaign image, and tag menswear products with gender "Men" in the admin so the
// /shop/?gender=Men view is populated.
const blocks: Block[] = [
  {
    label: "Women",
    href: "/shop/?gender=Women",
    image: "/images/tile-look-wide.jpg",
    alt: "QESHTA womenswear — sculpted leather and evening tailoring",
  },
  {
    label: "Men",
    href: "/shop/?gender=Men",
    image: "/images/product-detail-leather-jacket-chair.jpg",
    alt: "QESHTA menswear — refined leather outerwear",
  },
];

export function CollectionBlocks() {
  return (
    <section className={styles.blocks} aria-label="Shop by department">
      {blocks.map((block) => (
        <Link key={block.label} href={block.href} className={styles.block}>
          <img
            src={assetPath(block.image)}
            alt={block.alt}
            width={1200}
            height={1500}
            decoding="async"
            loading="lazy"
          />
          <div className={styles.content}>
            <h2>{block.label}</h2>
            <span className={styles.cta}>Shop Now</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
