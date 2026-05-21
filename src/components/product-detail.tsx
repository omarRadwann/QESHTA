"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  catalogProductToAvailability,
  catalogProductToProduct,
  fetchCatalogProductById,
  fetchProductAvailability,
  type ProductAvailability,
} from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
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
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);
  const displayProduct = liveProduct ?? product;
  const tabs = useMemo(() => getProductTabs(displayProduct), [displayProduct]);
  const variantChoices = useMemo<DisplayVariant[]>(
    () => displayProduct.variants ?? [getInitialVariant(displayProduct)],
    [displayProduct],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(variantChoices[0].id);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(productSizes[0]);
  const [activeTab, setActiveTab] = useState<ProductDetailTab["id"]>(tabs[0].id);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [lastAddedLabel, setLastAddedLabel] = useState("");
  const [availabilityState, setAvailabilityState] = useState<
    "available" | "checking" | "sold-out" | "unavailable"
  >(isSupabaseConfigured() ? "checking" : "available");
  const [liveAvailability, setLiveAvailability] =
    useState<ProductAvailability | null>(null);
  const cartStateResetTimer = useRef<number | null>(null);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const selectedVariant =
    variantChoices.find((variant) => variant.id === selectedVariantId) ?? variantChoices[0];
  const hasVariantChoices = variantChoices.length > 1;
  const mediaImage =
    selectedVariant.detailHeroImage ?? displayProduct.detailHeroImage ?? displayProduct.image;
  const mediaAlt =
    selectedVariant.detailHeroAlt ?? displayProduct.detailHeroAlt ?? displayProduct.alt;
  const hasEditorialMedia = Boolean(
    selectedVariant.detailHeroImage ?? displayProduct.detailHeroImage,
  );
  const canAddToCart = availabilityState === "available";
  const displayPrice = liveAvailability?.price ?? displayProduct.price;

  useEffect(() => {
    return () => {
      if (cartStateResetTimer.current) {
        window.clearTimeout(cartStateResetTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function syncAvailability() {
      try {
        const catalogProduct = await fetchCatalogProductById(supabase, product.id);

        if (!isMounted) return;

        if (!catalogProduct) {
          setLiveAvailability(null);
          setAvailabilityState("unavailable");
          return;
        }

        const availability = catalogProductToAvailability(catalogProduct);
        setLiveProduct(catalogProductToProduct(catalogProduct, product));
        setLiveAvailability(availability);
        setAvailabilityState(availability.isAvailable ? "available" : "sold-out");
      } catch {
        if (!isMounted) return;

        try {
          const availability = await fetchProductAvailability(supabase, product.id);

          if (!isMounted) return;
          setLiveAvailability(availability);
          setAvailabilityState(availability?.isAvailable ? "available" : "unavailable");
        } catch {
          if (isMounted) setAvailabilityState("available");
        }
      }
    }

    void syncAvailability();

    return () => {
      isMounted = false;
    };
  }, [product]);

  function addToCart() {
    if (!canAddToCart) return;

    if (cartStateResetTimer.current) {
      window.clearTimeout(cartStateResetTimer.current);
    }

    addCartLine({
      productId: displayProduct.id,
      name: displayProduct.name,
      price: displayPrice,
      image: selectedVariant.image,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      size: selectedSize,
    });
    setLastAddedLabel(`${selectedVariant.label} / ${selectedSize}`);
    setCartState("added");
    cartStateResetTimer.current = window.setTimeout(() => {
      setCartState("idle");
      cartStateResetTimer.current = null;
    }, 1800);
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
            <h1 id="product-title">{displayProduct.name}</h1>
            <p>${formatPrice(displayPrice)}</p>
          </div>
          {displayProduct.isNew ? <span>New</span> : null}
        </div>

        <div className={styles.displayImageFrame} aria-live="polite">
          <img
            key={selectedVariant.id}
            src={assetPath(selectedVariant.image)}
            alt={`${displayProduct.name} in ${selectedVariant.label}`}
            width={900}
            height={900}
            decoding="async"
          />
        </div>

        {hasVariantChoices ? (
          <div className={styles.variantList} aria-label="Choose color">
            {variantChoices.map((variant) => (
              <button
                key={variant.id}
                className={variant.id === selectedVariant.id ? styles.activeVariant : ""}
                type="button"
                aria-label={`Show ${displayProduct.name} in ${variant.label}`}
                aria-pressed={variant.id === selectedVariant.id}
                onClick={() => setSelectedVariantId(variant.id)}
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

        <button
          className={styles.cartButton}
          type="button"
          disabled={!canAddToCart}
          onClick={addToCart}
        >
          {getCartButtonLabel(availabilityState, cartState)}
        </button>
        <p className={styles.cartFeedback} aria-live="polite">
          {getCartFeedback(availabilityState, cartState, lastAddedLabel)}
        </p>

        <div className={styles.tabs} role="tablist" aria-label={`${displayProduct.name} details`}>
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

function getCartButtonLabel(
  availabilityState: "available" | "checking" | "sold-out" | "unavailable",
  cartState: "idle" | "added",
) {
  if (availabilityState === "checking") return "Checking Availability";
  if (availabilityState === "sold-out") return "Sold Out";
  if (availabilityState === "unavailable") return "Unavailable";
  return cartState === "added" ? "Added to Cart" : "Add to Cart";
}

function getCartFeedback(
  availabilityState: "available" | "checking" | "sold-out" | "unavailable",
  cartState: "idle" | "added",
  lastAddedLabel: string,
) {
  if (cartState === "added") return `${lastAddedLabel} added. Cart updated.`;
  if (availabilityState === "checking") return "Confirming live stock.";
  if (availabilityState === "sold-out") return "This piece is currently out of stock.";
  if (availabilityState === "unavailable") return "This piece is not available online.";
  return "\u00a0";
}
