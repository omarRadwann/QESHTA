/* eslint-disable @next/next/no-img-element */
import { assetPath } from "@/lib/assets";
import styles from "./shop-editorial-banner.module.css";

export function ShopEditorialBanner() {
  return (
    <section className={styles.banner} aria-label="QESHTA collection editorial">
      <img
        className={styles.backdrop}
        src={assetPath("/images/shop-editorial-banner.png")}
        alt="Leather styling campaign with a model, sofa, marble table, lamp, and heels"
        loading="lazy"
      />
      <div className={styles.inset} aria-hidden="true">
        <img
          src={assetPath("/images/shop-editorial-banner.png")}
          alt=""
          loading="lazy"
        />
        <div className={styles.thumbnails}>
          {[
            "/images/product-espresso-wrap-jacket.png",
            "/images/product-ivory-slingback.png",
            "/images/tile-shoes.png",
            "/images/tile-look-wide.png",
          ].map((image) => (
            <span key={image}>
              <img src={assetPath(image)} alt="" loading="lazy" />
            </span>
          ))}
        </div>
      </div>
      <p className={styles.leftCopy}>Which sets the character</p>
      <p className={styles.rightCopy}>The entire collection</p>
    </section>
  );
}
