import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartLine } from "@/lib/cart";
import type { Database, RemoteCartItemInsert } from "./types";

export function mergeCartLines(localLines: CartLine[], remoteLines: CartLine[]) {
  const merged = new Map<string, CartLine>();

  [...remoteLines, ...localLines].forEach((line) => {
    const existingLine = merged.get(line.key);

    if (existingLine) {
      merged.set(line.key, {
        ...existingLine,
        quantity: existingLine.quantity + line.quantity,
      });
      return;
    }

    merged.set(line.key, line);
  });

  return Array.from(merged.values());
}

export async function loadRemoteCart(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "key, product_id, name, price, image, variant_id, variant_label, size, quantity",
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    key: item.key,
    productId: item.product_id,
    name: item.name,
    price: item.price,
    image: item.image,
    variantId: item.variant_id,
    variantLabel: item.variant_label,
    size: item.size,
    quantity: item.quantity,
  }));
}

export async function saveRemoteCart(
  supabase: SupabaseClient<Database>,
  userId: string,
  lines: CartLine[],
) {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (cartError) throw cartError;

  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (deleteError) throw deleteError;
  if (lines.length === 0) return;

  const rows: RemoteCartItemInsert[] = lines.map((line) => ({
    cart_id: cart.id,
    image: line.image,
    key: line.key,
    name: line.name,
    price: line.price,
    product_id: line.productId,
    quantity: line.quantity,
    size: line.size,
    variant_id: line.variantId,
    variant_label: line.variantLabel,
  }));

  const { error: insertError } = await supabase.from("cart_items").insert(rows);
  if (insertError) throw insertError;
}

export async function clearRemoteCart(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart) return;

  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) throw error;
}
