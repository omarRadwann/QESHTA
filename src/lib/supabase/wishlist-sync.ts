import type { SupabaseClient } from "@supabase/supabase-js";
import type { WishlistItem } from "@/lib/wishlist";
import type { Database, WishlistItemInsert } from "./types";

export async function loadRemoteWishlist(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    createdAt: item.created_at,
    productId: item.product_id,
  }));
}

export async function saveRemoteWishlist(
  supabase: SupabaseClient<Database>,
  userId: string,
  items: WishlistItem[],
) {
  const { error: deleteError } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw deleteError;
  if (items.length === 0) return;

  const rows: WishlistItemInsert[] = items.map((item) => ({
    created_at: item.createdAt,
    product_id: item.productId,
    user_id: userId,
  }));

  const { error: insertError } = await supabase.from("wishlist_items").insert(rows);
  if (insertError) throw insertError;
}
