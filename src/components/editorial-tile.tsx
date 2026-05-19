import Image from "next/image";
import Link from "next/link";
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
  href = "#selected-products",
  priority = false,
}: EditorialTileProps) {
  return (
    <article className={styles.tile}>
      <Image src={image} alt={alt} fill sizes="(max-width: 760px) 100vw, 560px" priority={priority} />
      <div className={styles.copy}>
        <p>{eyebrow}</p>
        <Link href={href}>Shop Now</Link>
      </div>
    </article>
  );
}
