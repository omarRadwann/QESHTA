"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatPrice,
  getProductTabs,
  productSizes,
  type Product,
  type ProductDetailTab,
  type ProductSize,
  type ProductVariant,
} from "@/data/products";
import { assetPath } from "@/lib/assets";
import { addCartLine } from "@/lib/cart";
import styles from "./product-detail.module.css";

type ProductDetailProps = {
  product: Product;
};

type DisplayVariant = ProductVariant & {
  image: string;
};

function getInitialVariant(product: Product): DisplayVariant {
  return (
    product.variants?.[0] ?? {
      id: "default",
      label: product.color,
      color: product.color,
      image: product.image,
    }
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const tabs = useMemo(() => getProductTabs(product), [product]);
  const [selectedVariant, setSelectedVariant] = useState<DisplayVariant>(
    getInitialVariant(product),
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize>(productSizes[0]);
  const [activeTab, setActiveTab] = useState<ProductDetailTab["id"]>(tabs[0].id);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [lastAddedLabel, setLastAddedLabel] = useState("");

  const activeTabContent = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const hasVariantChoices = Boolean(product.variants && product.variants.length > 1);
  const mediaImage = selectedVariant.detailHeroImage ?? product.detailHeroImage ?? product.image;
  const mediaAlt = selectedVariant.detailHeroAlt ?? product.detailHeroAlt ?? product.alt;
  const hasEditorialMedia = Boolean(selectedVariant.detailHeroImage ?? product.detailHeroImage);

  function addToCart() {
    addCartLine({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: selectedVariant.image,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      size: selectedSize,
    });
    setLastAddedLabel(`${selectedVariant.label} / ${selectedSize}`);
    setCartState("added");
    window.setTimeout(() => setCartState("idle"), 1800);
  }

  return (
    <section className={styles.detail} aria-labelledby="product-title">
      <div className={styles.mediaPanel}>
        <img
          key={mediaImage}
          className={hasEditorialMedia ? styles.editorialImage : styles.productImage}
          src={assetPath(mediaImage)}
          alt={mediaAlt}
          width={1024}
          height={1536}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className={styles.purchasePanel}>
        <Link className={styles.backLink} href="/shop/">
          Back to Shop
        </Link>

        <div className={styles.metaRow}>
          <div>
            <h1 id="product-title">{product.name}</h1>
            <p>${formatPrice(product.price)}</p>
          </div>
          {product.isNew ? <span>New</span> : null}
        </div>

        <div className={styles.displayImageFrame} aria-live="polite">
          <img
            key={selectedVariant.id}
            src={assetPath(selectedVariant.image)}
            alt={`${product.name} in ${selectedVariant.label}`}
            width={900}
            height={900}
            decoding="async"
          />
        </div>

        {hasVariantChoices ? (
          <div className={styles.variantList} aria-label="Choose color">
            {product.variants?.map((variant) => (
              <button
                key={variant.id}
                className={variant.id === selectedVariant.id ? styles.activeVariant : ""}
                type="button"
                aria-label={`Show ${product.name} in ${variant.label}`}
                aria-pressed={variant.id === selectedVariant.id}
                onClick={() => setSelectedVariant(variant)}
                title={variant.label}
              >
                <img
                  src={assetPath(variant.thumbnail ?? variant.image)}
                  alt=""
                  width={120}
                  height={120}
                  decoding="async"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.sizeRow}>
          <div className={styles.sizeList} aria-label="Choose size">
            {productSizes.map((size) => (
              <button
                key={size}
                className={size === selectedSize ? styles.activeSize : ""}
                type="button"
                aria-pressed={size === selectedSize}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            className={styles.fitButton}
            type="button"
            onClick={() => setActiveTab("size-fit")}
          >
            Find my fit
          </button>
        </div>

        <button className={styles.cartButton} type="button" onClick={addToCart}>
          {cartState === "added" ? "Added to Cart" : "Add to Cart"}
        </button>
        <p className={styles.cartFeedback} aria-live="polite">
          {cartState === "added" ? `${lastAddedLabel} added. Cart updated.` : "\u00a0"}
        </p>

        <div className={styles.tabs} role="tablist" aria-label={`${product.name} details`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={activeTab === tab.id ? styles.activeTab : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p
          id={`panel-${activeTabContent.id}`}
          className={styles.detailCopy}
          role="tabpanel"
          aria-labelledby={`tab-${activeTabContent.id}`}
        >
          {activeTabContent.body}
        </p>

        <div className={styles.footerLine}>
          <a href="mailto:hello@qeshta.com">Need help?</a>
          <span>Free worldwide shipping</span>
        </div>
      </div>
    </section>
  );
}
