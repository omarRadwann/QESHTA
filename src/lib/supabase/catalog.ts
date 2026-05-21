import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalogProduct, Database } from "./types";

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
