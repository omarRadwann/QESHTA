import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Product,
  ProductDetailTab,
  ProductGender,
  ProductVariant,
  ShopCategory,
} from "@/data/products";
import type { CatalogProduct, ContentBanner, Database } from "./types";

export type PublicCatalogProduct = Pick<
  CatalogProduct,
  | "allow_backorder"
  | "inventory_quantity"
  | "low_stock_threshold"
  | "price"
  | "product_id"
  | "status"
  | "updated_at"
>;

export type ProductAvailability = {
  allowBackorder: boolean;
  inventoryQuantity: number;
  isAvailable: boolean;
  isLowStock: boolean;
  price: number;
  productId: string;
  status: string;
};

const catalogProductColumns =
  "allow_backorder, alt, category, collection, color, color_hex, created_at, description, detail_hero_alt, detail_hero_image, detail_tabs, featured, gender, image, inventory_quantity, is_new, low_stock_threshold, material, name, price, product_id, status, tags, updated_at, variants";

export async function fetchPublicCatalog(
  supabase: SupabaseClient<Database>,
): Promise<ProductAvailability[]> {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(
      "allow_backorder, inventory_quantity, low_stock_threshold, price, product_id, status, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeAvailability);
}

export async function fetchPublicCatalogProducts(
  supabase: SupabaseClient<Database>,
): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(catalogProductColumns)
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCatalogProductById(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(catalogProductColumns)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchHomepageProducts(
  supabase: SupabaseClient<Database>,
  slot: string,
): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("homepage_products")
    .select(`sort_order, catalog_products(${catalogProductColumns})`)
    .eq("slot", slot)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<{
    catalog_products: CatalogProduct | null;
  }>;

  return rows
    .map((row) => row.catalog_products)
    .filter((product): product is CatalogProduct => Boolean(product));
}

export async function fetchBannersBySlot(
  supabase: SupabaseClient<Database>,
  slot: string,
): Promise<ContentBanner[]> {
  const { data, error } = await supabase
    .from("content_banners")
    .select("*")
    .eq("slot", slot)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchProductAvailability(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<ProductAvailability | null> {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(
      "allow_backorder, inventory_quantity, low_stock_threshold, price, product_id, status, updated_at",
    )
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeAvailability(data) : null;
}

export function createAvailabilityMap(products: ProductAvailability[]) {
  return new Map(products.map((product) => [product.productId, product]));
}

export function catalogProductToAvailability(product: PublicCatalogProduct) {
  return normalizeAvailability(product);
}

export function catalogProductToProduct(
  product: CatalogProduct,
  fallback?: Product,
): Product {
  const category = normalizeCategory(product.category, fallback?.category);
  const description = product.description?.trim() || fallback?.description || product.name;
  const variants = parseVariants(product.variants, fallback?.variants);
  const detailTabs = parseDetailTabs(product.detail_tabs, fallback?.detailTabs);

  return {
    id: product.product_id,
    name: product.name,
    price: Number(product.price),
    image: product.image,
    alt: product.alt?.trim() || fallback?.alt || product.name,
    category,
    color: product.color?.trim() || fallback?.color || "Core",
    colorHex: product.color_hex?.trim() || fallback?.colorHex || undefined,
    gender: normalizeGender(product.gender, fallback?.gender),
    material: product.material?.trim() || fallback?.material || "Mixed material",
    collection: product.collection || fallback?.collection || "Spring 26",
    description,
    tags: product.tags.length > 0 ? product.tags : fallback?.tags ?? [category.toLowerCase()],
    featured: product.featured,
    isNew: product.is_new || fallback?.isNew,
    detailHeroImage: product.detail_hero_image || fallback?.detailHeroImage,
    detailHeroAlt: product.detail_hero_alt || fallback?.detailHeroAlt,
    detailTabs,
    variants,
    catalogOnly: !fallback,
  };
}

function normalizeAvailability(product: PublicCatalogProduct): ProductAvailability {
  const isStocked = product.inventory_quantity > 0;

  return {
    allowBackorder: product.allow_backorder,
    inventoryQuantity: product.inventory_quantity,
    isAvailable: product.status === "active" && (product.allow_backorder || isStocked),
    isLowStock:
      product.status === "active" &&
      !product.allow_backorder &&
      product.inventory_quantity > 0 &&
      product.inventory_quantity <= product.low_stock_threshold,
    price: Number(product.price),
    productId: product.product_id,
    status: product.status,
  };
}

function normalizeCategory(
  category: string,
  fallback?: Exclude<ShopCategory, "View All">,
): Exclude<ShopCategory, "View All"> {
  const allowed: Exclude<ShopCategory, "View All">[] = [
    "Coats & Jackets",
    "Bottoms",
    "Tops",
    "Dresses",
    "Accessories",
    "Shoes",
  ];

  return allowed.includes(category as Exclude<ShopCategory, "View All">)
    ? (category as Exclude<ShopCategory, "View All">)
    : fallback ?? "Accessories";
}

function normalizeGender(
  gender: string | null | undefined,
  fallback?: ProductGender,
): ProductGender {
  const allowed: ProductGender[] = ["Women", "Men", "Unisex"];
  return allowed.includes(gender as ProductGender)
    ? (gender as ProductGender)
    : fallback ?? "Women";
}

function parseDetailTabs(value: unknown, fallback?: ProductDetailTab[]) {
  if (!Array.isArray(value)) return fallback;

  const tabs = value.filter((tab): tab is ProductDetailTab => {
    if (!tab || typeof tab !== "object") return false;
    const candidate = tab as Record<string, unknown>;
    return (
      ["description", "size-fit", "material", "care"].includes(String(candidate.id)) &&
      typeof candidate.label === "string" &&
      typeof candidate.body === "string"
    );
  });

  return tabs.length > 0 ? tabs : fallback;
}

function parseVariants(value: unknown, fallback?: ProductVariant[]) {
  if (!Array.isArray(value)) return fallback;

  const variants = value.filter((variant): variant is ProductVariant => {
    if (!variant || typeof variant !== "object") return false;
    const candidate = variant as Record<string, unknown>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.label === "string" &&
      typeof candidate.color === "string" &&
      typeof candidate.image === "string"
    );
  });

  return variants.length > 0 ? variants : fallback;
}
