import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartLine } from "@/lib/cart";
import type { Database, Order, OrderItem } from "./types";

export type CheckoutDetails = {
  addressLine1: string;
  city: string;
  country: string;
  customerEmail: string;
  customerName: string;
  notes: string;
  phone: string;
};

export type CustomerOrder = Order & {
  items: OrderItem[];
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
      p_notes: details.notes.trim(),
      p_phone: details.phone.trim(),
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

export async function fetchCustomerOrders(
  supabase: SupabaseClient<Database>,
): Promise<CustomerOrder[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!sessionData.session) return [];

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((order) => order.id);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (itemsError) throw itemsError;

  const itemsByOrder = new Map<string, OrderItem[]>();

  (items ?? []).forEach((item) => {
    const currentItems = itemsByOrder.get(item.order_id) ?? [];
    currentItems.push(item);
    itemsByOrder.set(item.order_id, currentItems);
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) ?? [],
  }));
}
