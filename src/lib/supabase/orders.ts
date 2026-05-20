import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartLine } from "@/lib/cart";
import type { Database } from "./types";

export type CheckoutDetails = {
  addressLine1: string;
  city: string;
  country: string;
  customerEmail: string;
  customerName: string;
  notes: string;
  phone: string;
};

export async function createOrder(
  supabase: SupabaseClient<Database>,
  lines: CartLine[],
  details: CheckoutDetails,
) {
  if (lines.length === 0) {
    throw new Error("Cannot create an order from an empty cart.");
  }

  const { data, error } = await supabase
    .rpc("create_customer_order", {
      p_customer_email: details.customerEmail,
      p_customer_name: details.customerName,
      p_items: lines.map((line) => ({
        image: line.image,
        name: line.name,
        price: line.price,
        productId: line.productId,
        quantity: line.quantity,
        size: line.size,
        variantId: line.variantId,
        variantLabel: line.variantLabel,
      })),
      p_notes: details.notes.trim() || null,
      p_phone: details.phone.trim() || null,
      p_shipping_address: {
        addressLine1: details.addressLine1,
        city: details.city,
        country: details.country,
      },
    })
    .single();

  if (error) throw error;
  return data;
}
