"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ShopEditorialBanner } from "@/components/shop-editorial-banner";
import {
  getProductUrl,
  shopCategories,
  shopSortOptions,
  type Product,
  type ShopCategory,
  type ShopSort,
} from "@/data/products";
import {
  createAvailabilityMap,
  fetchPublicCatalog,
  type ProductAvailability,
} from "@/lib/supabase/catalog";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import styles from "./shop-catalog.module.css";

type ShopCatalogProps = {
  products: Product[];
};

const initialVisibleCount = 16;

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function matchesSelected(value: string, selected: string[]) {
  return selected.length === 0 || selected.includes(value);
}

export function ShopCatalog({ products }: ShopCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("View All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ShopSort>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [availability, setAvailability] = useState<ProductAvailability[] | null>(null);
  const [catalogMessage, setCatalogMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();

    async function syncCatalog() {
      try {
        const productsAvailability = await fetchPublicCatalog(supabase);

        if (isMounted) {
          setAvailability(productsAvailability);
          setCatalogMessage("");
        }
      } catch {
        if (isMounted) {
          setCatalogMessage("Live stock is updating. Product checkout will confirm availability.");
        }
      }
    }

    void syncCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const materialOptions = useMemo(
    () => uniqueSorted(products.map((product) => product.material)),
    [products],
  );
  const colorOptions = useMemo(
    () => uniqueSorted(products.map((product) => product.color)),
    [products],
  );
  const availabilityMap = useMemo(
    () => (availability ? createAvailabilityMap(availability) : null),
    [availability],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const priceCeiling = maxPrice === "all" ? Infinity : Number(maxPrice);

    const nextProducts = products.filter((product) => {
      const availabilityState = availabilityMap?.get(product.id);
      const displayPrice = availabilityState?.price ?? product.price;
      const catalogMatch = availabilityMap ? Boolean(availabilityState) : true;
      const categoryMatch =
        activeCategory === "View All" || product.category === activeCategory;
      const queryMatch =
        normalizedQuery.length === 0 ||
        [
          product.name,
          product.category,
          product.color,
          product.material,
          product.description,
          ...product.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        catalogMatch &&
        categoryMatch &&
        queryMatch &&
        matchesSelected(product.material, materials) &&
        matchesSelected(product.color, colors) &&
        displayPrice <= priceCeiling
      );
    });

    return [...nextProducts].sort((a, b) => {
      const priceA = availabilityMap?.get(a.id)?.price ?? a.price;
      const priceB = availabilityMap?.get(b.id)?.price ?? b.price;

      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      if (sort === "newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      return 0;
    });
  }, [
    activeCategory,
    availabilityMap,
    colors,
    materials,
    maxPrice,
    products,
    query,
    sort,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasActiveFilters =
    activeCategory !== "View All" ||
    query.trim().length > 0 ||
    materials.length > 0 ||
    colors.length > 0 ||
    maxPrice !== "all";

  function resetVisibleCount() {
    setVisibleCount(initialVisibleCount);
  }

  function toggleListValue(value: string, current: string[], next: (values: string[]) => void) {
    next(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    resetVisibleCount();
  }

  function clearFilters() {
    setActiveCategory("View All");
    setQuery("");
    setSort("featured");
    setMaterials([]);
    setColors([]);
    setMaxPrice("all");
    resetVisibleCount();
  }

  return (
    <section className={styles.catalog} aria-labelledby="shop-heading">
      <div className={styles.headingRow}>
        <p id="shop-heading">Spring 26</p>
        <button
          className={styles.filterToggle}
          type="button"
          aria-expanded={showFilters}
          aria-controls="shop-filters"
          onClick={() => setShowFilters((value) => !value)}
        >
          Filters
        </button>
      </div>

      <div className={styles.searchRow}>
        <label htmlFor="shop-search">Search</label>
        <input
          id="shop-search"
          type="search"
          value={query}
          placeholder="Search"
          onChange={(event) => {
            setQuery(event.target.value);
            resetVisibleCount();
          }}
        />

        <label htmlFor="shop-sort">Sort</label>
        <select
          id="shop-sort"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as ShopSort);
            resetVisibleCount();
          }}
        >
          {shopSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.categoryBar} aria-label="Product categories">
        {shopCategories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? styles.activeCategory : ""}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              resetVisibleCount();
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        id="shop-filters"
        className={`${styles.filters} ${showFilters ? styles.filtersOpen : ""}`}
      >
        <fieldset>
          <legend>Material</legend>
          {materialOptions.map((material) => (
            <label key={material}>
              <input
                type="checkbox"
                checked={materials.includes(material)}
                onChange={() => toggleListValue(material, materials, setMaterials)}
              />
              {material}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Color</legend>
          {colorOptions.map((color) => (
            <label key={color}>
              <input
                type="checkbox"
                checked={colors.includes(color)}
                onChange={() => toggleListValue(color, colors, setColors)}
              />
              {color}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Price</legend>
          <label>
            <input
              type="radio"
              name="price"
              checked={maxPrice === "all"}
              onChange={() => {
                setMaxPrice("all");
                resetVisibleCount();
              }}
            />
            All prices
          </label>
          {["750", "1000", "1500", "2500"].map((price) => (
            <label key={price}>
              <input
                type="radio"
                name="price"
                checked={maxPrice === price}
                onChange={() => {
                  setMaxPrice(price);
                  resetVisibleCount();
                }}
              />
              Under ${price}
            </label>
          ))}
        </fieldset>

        {hasActiveFilters ? (
          <button className={styles.clearButton} type="button" onClick={clearFilters}>
            Clear
          </button>
        ) : null}
      </div>

      <div className={styles.resultMeta} aria-live="polite">
        {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
      </div>

      {catalogMessage ? <p className={styles.catalogMessage}>{catalogMessage}</p> : null}

      {filteredProducts.length > 0 ? (
        <div className={styles.grid}>
          {visibleProducts.slice(0, 8).map((product, index) => {
            const productAvailability = availabilityMap?.get(product.id);

            return (
              <ProductCard
                key={product.id}
                product={product}
                displayPrice={productAvailability?.price}
                href={getProductUrl(product)}
                isLowStock={productAvailability?.isLowStock}
                isSoldOut={productAvailability ? !productAvailability.isAvailable : false}
                priority={index < 4}
                revealIndex={index}
              />
            );
          })}

          {!hasActiveFilters && filteredProducts.length > 8 ? <ShopEditorialBanner /> : null}

          {visibleProducts.slice(8).map((product, index) => {
            const productAvailability = availabilityMap?.get(product.id);

            return (
              <ProductCard
                key={product.id}
                product={product}
                displayPrice={productAvailability?.price}
                href={getProductUrl(product)}
                isLowStock={productAvailability?.isLowStock}
                isSoldOut={productAvailability ? !productAvailability.isAvailable : false}
                revealIndex={index + 8}
              />
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No products found.</p>
          <button type="button" onClick={clearFilters}>
            Reset
          </button>
        </div>
      )}

      {visibleCount < filteredProducts.length ? (
        <button
          className={styles.loadMore}
          type="button"
          onClick={() => setVisibleCount((count) => count + 4)}
        >
          Load more
        </button>
      ) : (
        <p className={styles.endLabel}>Loading more...</p>
      )}
    </section>
  );
}
