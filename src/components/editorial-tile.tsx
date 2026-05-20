/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { assetPath } from "@/lib/assets";
import styles from "./editorial-tile.module.css";

type EditorialTileProps = {
  image: string;
  alt: string;
  eyebrow: string;
  href?: string;
  priority?: boolean;
};

export function EditorialTile({
  image,
  alt,
  eyebrow,
  href = "/shop/",
  priority = false,
}: EditorialTileProps) {
  return (
    <article className={styles.tile}>
      <img
        src={assetPath(image)}
        alt={alt}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
      />
      <div className={styles.copy}>
        <p>{eyebrow}</p>
        <Link href={href}>Shop Now</Link>
      </div>
    </article>
  );
}
