export const CART_STORAGE_KEY = "qeshta-cart";
export const CART_CHANGE_EVENT = "qeshta-cart-change";
export const CART_DRAWER_OPEN = "qeshta-cart-drawer-open";

/** Dispatch the event that opens the global slide-out cart drawer. */
export function openCartDrawer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_DRAWER_OPEN));
}

export type CartLine = {
  key: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  variantId: string;
  variantLabel: string;
  size: string;
  quantity: number;
};

type NewCartLine = Omit<CartLine, "key" | "quantity"> & {
  quantity?: number;
};

export function makeCartLineKey(productId: string, variantId: string, size: string) {
  return `${productId}:${variantId}:${size}`;
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!rawCart) return [];
    const parsed = JSON.parse(rawCart);
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT, { detail: lines }));
}

export function addCartLine(line: NewCartLine) {
  const key = makeCartLineKey(line.productId, line.variantId, line.size);
  const cart = readCart();
  const existingLine = cart.find((item) => item.key === key);
  const quantity = Math.max(1, normalizeQuantity(line.quantity ?? 1));

  if (existingLine) {
    existingLine.quantity += quantity;
    writeCart(cart);
    return cart;
  }

  const nextCart = [
    ...cart,
    {
      ...line,
      key,
      quantity,
    },
  ];
  writeCart(nextCart);
  return nextCart;
}

export function updateCartLineQuantity(key: string, quantity: number) {
  const nextQuantity = normalizeQuantity(quantity, 0);
  const nextCart = readCart()
    .map((line) => (line.key === key ? { ...line, quantity: nextQuantity } : line))
    .filter((line) => line.quantity > 0);
  writeCart(nextCart);
  return nextCart;
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount(lines: CartLine[]) {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

export function getCartSubtotal(lines: CartLine[]) {
  return lines.reduce((subtotal, line) => subtotal + line.price * line.quantity, 0);
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.key === "string" &&
    typeof line.productId === "string" &&
    typeof line.name === "string" &&
    typeof line.price === "number" &&
    Number.isFinite(line.price) &&
    line.price >= 0 &&
    typeof line.image === "string" &&
    typeof line.variantId === "string" &&
    typeof line.variantLabel === "string" &&
    typeof line.size === "string" &&
    typeof line.quantity === "number" &&
    Number.isFinite(line.quantity) &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

function normalizeQuantity(quantity: number, fallback = 1) {
  if (!Number.isFinite(quantity)) return fallback;
  return Math.max(0, Math.floor(quantity));
}
