"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterDropdown } from "@/components/filter-dropdown";
import { ProductCard } from "@/components/product-card";
import { ShopEditorialBanner } from "@/components/shop-editorial-banner";
import {
  formatPrice,
  getProductUrl,
  productGenders,
  shopCategories,
  shopSortOptions,
  type Product,
  type ShopCategory,
  type ShopSort,
} from "@/data/products";
import {
  catalogProductToAvailability,
  catalogProductToProduct,
  createAvailabilityMap,
  fetchPublicCatalogProducts,
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
const priceCeilings = ["750", "1000", "1500", "2500"];

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
  const [genders, setGenders] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [availability, setAvailability] = useState<ProductAvailability[] | null>(null);
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [catalogMessage, setCatalogMessage] = useState("");
  const catalogProducts = liveProducts ?? products;

  // Honor ?category= and ?gender= deep links (e.g. footer "Shop" links and the
  // homepage Women/Men blocks) on first load. This is a deliberate one-time,
  // client-only sync that must run AFTER hydration: reading window.location in a
  // useState initializer would crash during static export (no window) and
  // otherwise cause a server/client hydration mismatch.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const requestedGender = params.get("gender");
    if (requestedCategory && (shopCategories as readonly string[]).includes(requestedCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration URL sync (see comment above)
      setActiveCategory(requestedCategory as ShopCategory);
    }
    if (requestedGender && (productGenders as readonly string[]).includes(requestedGender)) {
      setGenders([requestedGender]);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabaseBrowserClient();
    const fallbackProducts = new Map(products.map((product) => [product.id, product]));

    async function syncCatalog() {
      try {
        const catalogProducts = await fetchPublicCatalogProducts(supabase);

        if (isMounted) {
          setLiveProducts(
            catalogProducts.map((product) =>
              catalogProductToProduct(product, fallbackProducts.get(product.product_id)),
            ),
          );
          setAvailability(catalogProducts.map(catalogProductToAvailability));
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
  }, [products]);

  const materialOptions = useMemo(
    () => uniqueSorted(catalogProducts.map((product) => product.material)),
    [catalogProducts],
  );
  const colorOptions = useMemo(
    () => uniqueSorted(catalogProducts.map((product) => product.color)),
    [catalogProducts],
  );
  const availabilityMap = useMemo(
    () => (availability ? createAvailabilityMap(availability) : null),
    [availability],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const priceCeiling = maxPrice === "all" ? Infinity : Number(maxPrice);

    const nextProducts = catalogProducts.filter((product) => {
      const availabilityState = availabilityMap?.get(product.id);
      const displayPrice = availabilityState?.price ?? product.price;
      const catalogMatch = availabilityMap ? Boolean(availabilityState) : true;
      const categoryMatch =
        activeCategory === "View All" || product.category === activeCategory;
      const gender = product.gender ?? "Women";
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
        matchesSelected(gender, genders) &&
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
    genders,
    materials,
    maxPrice,
    catalogProducts,
    query,
    sort,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasActiveFilters =
    activeCategory !== "View All" ||
    query.trim().length > 0 ||
    genders.length > 0 ||
    materials.length > 0 ||
    colors.length > 0 ||
    maxPrice !== "all";

  const sortLabel = shopSortOptions.find((option) => option.value === sort)?.label;

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
    setGenders([]);
    setMaterials([]);
    setColors([]);
    setMaxPrice("all");
    resetVisibleCount();
  }

  return (
    <section className={styles.catalog} aria-label="Shop catalog">
      <div className={styles.toolbar}>
        <div className={styles.toolbarRow}>
          <div className={styles.search}>
            <label htmlFor="shop-search">Search</label>
            <input
              id="shop-search"
              type="search"
              value={query}
              placeholder="Search the edit"
              onChange={(event) => {
                setQuery(event.target.value);
                resetVisibleCount();
              }}
            />
          </div>
          <p className={styles.resultMeta} aria-live="polite">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
            {hasActiveFilters ? (
              <button className={styles.clearButton} type="button" onClick={clearFilters}>
                Clear all
              </button>
            ) : null}
          </p>
        </div>

        <div className={styles.filterRow}>
          <FilterDropdown label="Sort" summary={sort !== "featured" ? sortLabel : undefined}>
            {shopSortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.panelButton} ${sort === option.value ? styles.panelButtonActive : ""}`}
                onClick={() => {
                  setSort(option.value);
                  resetVisibleCount();
                }}
              >
                {option.label}
              </button>
            ))}
          </FilterDropdown>

          <FilterDropdown label="Gender" badge={genders.length || undefined}>
            {productGenders.map((gender) => (
              <label key={gender} className={styles.panelOption}>
                <input
                  type="checkbox"
                  checked={genders.includes(gender)}
                  onChange={() => toggleListValue(gender, genders, setGenders)}
                />
                {gender}
              </label>
            ))}
          </FilterDropdown>

          <FilterDropdown
            label="Category"
            summary={activeCategory !== "View All" ? activeCategory : undefined}
          >
            {shopCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.panelButton} ${activeCategory === category ? styles.panelButtonActive : ""}`}
                onClick={() => {
                  setActiveCategory(category as ShopCategory);
                  resetVisibleCount();
                }}
              >
                {category}
              </button>
            ))}
          </FilterDropdown>

          <FilterDropdown label="Color" badge={colors.length || undefined}>
            {colorOptions.map((color) => (
              <label key={color} className={styles.panelOption}>
                <input
                  type="checkbox"
                  checked={colors.includes(color)}
                  onChange={() => toggleListValue(color, colors, setColors)}
                />
                {color}
              </label>
            ))}
          </FilterDropdown>

          <FilterDropdown label="Material" badge={materials.length || undefined}>
            {materialOptions.map((material) => (
              <label key={material} className={styles.panelOption}>
                <input
                  type="checkbox"
                  checked={materials.includes(material)}
                  onChange={() => toggleListValue(material, materials, setMaterials)}
                />
                {material}
              </label>
            ))}
          </FilterDropdown>

          <FilterDropdown label="Price" badge={maxPrice !== "all" ? 1 : undefined}>
            <label className={styles.panelOption}>
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
            {priceCeilings.map((price) => (
              <label key={price} className={styles.panelOption}>
                <input
                  type="radio"
                  name="price"
                  checked={maxPrice === price}
                  onChange={() => {
                    setMaxPrice(price);
                    resetVisibleCount();
                  }}
                />
                Under {formatPrice(Number(price))}
              </label>
            ))}
          </FilterDropdown>
        </div>
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
        <p className={styles.endLabel}>End of the edit</p>
      )}
    </section>
  );
}
