import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type {
  AccountRole,
  CatalogProduct,
  CatalogProductInsert,
  CatalogProductStatus,
  CatalogProductUpdate,
  CustomerProfile,
  Database,
  Order,
  OrderItem,
  OrderUpdate,
  OrderStatus,
} from "./types";

export type AdminSnapshot = {
  catalogProducts: CatalogProduct[];
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
  const [catalogResult, ordersResult, profilesResult] = await Promise.all([
    supabase.from("catalog_products").select("*").order("name", { ascending: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  if (catalogResult.error) throw catalogResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (profilesResult.error) throw profilesResult.error;

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
    catalogProducts: catalogResult.data,
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
    | "description"
    | "detail_hero_alt"
    | "detail_hero_image"
    | "detail_tabs"
    | "featured"
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
