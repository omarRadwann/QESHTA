import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type {
  AccountRole,
  CatalogProduct,
  CatalogProductInsert,
  CatalogProductStatus,
  CatalogProductUpdate,
  ContentBanner,
  ContentBannerInsert,
  ContentBannerUpdate,
  CustomerProfile,
  Database,
  HomepageProduct,
  HomepageProductInsert,
  Order,
  OrderItem,
  OrderUpdate,
  OrderStatus,
} from "./types";

export type AdminSnapshot = {
  banners: ContentBanner[];
  catalogProducts: CatalogProduct[];
  homepageProducts: HomepageProduct[];
  orderItems: OrderItem[];
  orders: Order[];
  profiles: CustomerProfile[];
};

export type AdminAccess = {
  profile: CustomerProfile | null;
  session: Session | null;
};

export const orderStatuses: { label: string; value: OrderStatus }[] = [
  { label: "Pending review", value: "pending_review" },
  { label: "Paid", value: "paid" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

export const catalogStatuses: { label: string; value: CatalogProductStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

export async function getAdminAccess(
  supabase: SupabaseClient<Database>,
): Promise<AdminAccess> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!sessionData.session) return { profile: null, session: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sessionData.session.user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  return {
    profile: profile?.role === "admin" ? profile : null,
    session: sessionData.session,
  };
}

export async function fetchAdminSnapshot(
  supabase: SupabaseClient<Database>,
): Promise<AdminSnapshot> {
  const [catalogResult, ordersResult, profilesResult, bannersResult, homepageResult] =
    await Promise.all([
      supabase.from("catalog_products").select("*").order("name", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("content_banners")
        .select("*")
        .order("slot", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("homepage_products")
        .select("*")
        .order("slot", { ascending: true })
        .order("sort_order", { ascending: true }),
    ]);

  if (catalogResult.error) throw catalogResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (bannersResult.error) throw bannersResult.error;
  if (homepageResult.error) throw homepageResult.error;

  const orderIds = ordersResult.data.map((order) => order.id);
  const orderItemsResult =
    orderIds.length > 0
      ? await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: true })
      : { data: [] as OrderItem[], error: null };

  if (orderItemsResult.error) throw orderItemsResult.error;

  return {
    banners: bannersResult.data,
    catalogProducts: catalogResult.data,
    homepageProducts: homepageResult.data,
    orderItems: orderItemsResult.data,
    orders: ordersResult.data,
    profiles: profilesResult.data,
  };
}

export async function updateOrderStatus(
  supabase: SupabaseClient<Database>,
  orderId: string,
  status: OrderStatus,
) {
  await updateOrderManagement(supabase, orderId, { status });
}

export async function updateOrderManagement(
  supabase: SupabaseClient<Database>,
  orderId: string,
  patch: Pick<OrderUpdate, "notes" | "status">,
) {
  const { error } = await supabase
    .from("orders")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;
}

export async function updateCatalogProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
  patch: Pick<
    CatalogProductUpdate,
    | "allow_backorder"
    | "alt"
    | "category"
    | "collection"
    | "color"
    | "color_hex"
    | "description"
    | "detail_hero_alt"
    | "detail_hero_image"
    | "detail_tabs"
    | "featured"
    | "gender"
    | "image"
    | "inventory_quantity"
    | "is_new"
    | "low_stock_threshold"
    | "material"
    | "name"
    | "price"
    | "status"
    | "tags"
    | "variants"
  >,
) {
  const { error } = await supabase
    .from("catalog_products")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", productId);

  if (error) throw error;
}

export async function createCatalogProduct(
  supabase: SupabaseClient<Database>,
  product: CatalogProductInsert,
) {
  const { error } = await supabase.from("catalog_products").insert(product);

  if (error) throw error;
}

export async function deleteCatalogProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
) {
  const { error } = await supabase
    .from("catalog_products")
    .delete()
    .eq("product_id", productId);

  if (error) throw error;
}

export async function updateCustomerRole(
  supabase: SupabaseClient<Database>,
  profileId: string,
  role: AccountRole,
) {
  const { error } = await supabase.rpc("set_customer_role", {
    p_profile_id: profileId,
    p_role: role,
  });

  if (error) throw error;
}

// --- Content banners ---------------------------------------------------------

export const bannerSlots: { label: string; value: string }[] = [
  { label: "Shop page banner", value: "shop_top" },
  { label: "Home hero", value: "home_hero" },
  { label: "Home best-seller banner", value: "home_bestseller" },
];

export async function createBanner(
  supabase: SupabaseClient<Database>,
  banner: ContentBannerInsert,
) {
  const { error } = await supabase.from("content_banners").insert(banner);
  if (error) throw error;
}

export async function updateBanner(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: ContentBannerUpdate,
) {
  const { error } = await supabase
    .from("content_banners")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteBanner(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("content_banners").delete().eq("id", id);
  if (error) throw error;
}

// --- Homepage product curation ----------------------------------------------

export const homepageSlots: { label: string; value: string }[] = [
  { label: "Selected products (carousel)", value: "selected" },
  { label: "Best sellers", value: "bestseller" },
  { label: "Featured", value: "featured" },
];

export async function addHomepageProduct(
  supabase: SupabaseClient<Database>,
  row: HomepageProductInsert,
) {
  const { error } = await supabase
    .from("homepage_products")
    .upsert(row, { onConflict: "slot,product_id" });
  if (error) throw error;
}

export async function updateHomepageProduct(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: { sort_order?: number; is_active?: boolean },
) {
  const { error } = await supabase
    .from("homepage_products")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function removeHomepageProduct(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase.from("homepage_products").delete().eq("id", id);
  if (error) throw error;
}
