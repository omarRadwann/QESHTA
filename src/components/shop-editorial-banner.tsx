/* eslint-disable @next/next/no-img-element */
import { assetPath } from "@/lib/assets";
import styles from "./shop-editorial-banner.module.css";

export function ShopEditorialBanner() {
  return (
    <section className={styles.banner} aria-label="QESHTA collection editorial">
      <img
        className={styles.backdrop}
        src={assetPath("/images/shop-editorial-banner.jpg")}
        alt="Leather styling campaign with a model, sofa, marble table, lamp, and heels"
        width={1600}
        height={640}
        decoding="async"
        loading="lazy"
      />
      <div className={styles.inset} aria-hidden="true">
        <img
          src={assetPath("/images/shop-editorial-banner.jpg")}
          alt=""
          width={1600}
          height={640}
          decoding="async"
          loading="lazy"
        />
        <div className={styles.thumbnails}>
          {[
            "/images/product-espresso-wrap-jacket.jpg",
            "/images/product-ivory-slingback.jpg",
            "/images/product-burgundy-bag.jpg",
            "/images/product-black-sculpted-dress.jpg",
          ].map((image) => (
            <span key={image}>
              <img
                src={assetPath(image)}
                alt=""
                width={900}
                height={900}
                decoding="async"
                loading="lazy"
              />
            </span>
          ))}
        </div>
      </div>
      <p className={styles.leftCopy}>Which sets the character</p>
      <p className={styles.rightCopy}>The entire collection</p>
    </section>
  );
}
