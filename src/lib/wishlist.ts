export const WISHLIST_STORAGE_KEY = "qeshta-wishlist";
export const WISHLIST_CHANGE_EVENT = "qeshta-wishlist-change";

export type WishlistItem = {
  productId: string;
  createdAt: string;
};

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!rawWishlist) return [];
    const parsed = JSON.parse(rawWishlist);
    return Array.isArray(parsed) ? normalizeWishlist(parsed) : [];
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;

  const nextItems = normalizeWishlist(items);
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextItems));
  window.dispatchEvent(new CustomEvent(WISHLIST_CHANGE_EVENT, { detail: nextItems }));
}

export function isWishlisted(productId: string, items = readWishlist()) {
  return items.some((item) => item.productId === productId);
}

export function toggleWishlistProduct(productId: string) {
  const wishlist = readWishlist();

  if (isWishlisted(productId, wishlist)) {
    const nextWishlist = wishlist.filter((item) => item.productId !== productId);
    writeWishlist(nextWishlist);
    return { isWishlisted: false, items: nextWishlist };
  }

  const nextWishlist = [
    {
      createdAt: new Date().toISOString(),
      productId,
    },
    ...wishlist,
  ];
  writeWishlist(nextWishlist);
  return { isWishlisted: true, items: nextWishlist };
}

export function removeWishlistProduct(productId: string) {
  const nextWishlist = readWishlist().filter((item) => item.productId !== productId);
  writeWishlist(nextWishlist);
  return nextWishlist;
}

export function clearWishlist() {
  writeWishlist([]);
}

export function getWishlistCount(items: WishlistItem[]) {
  return normalizeWishlist(items).length;
}

export function mergeWishlistItems(localItems: WishlistItem[], remoteItems: WishlistItem[]) {
  return normalizeWishlist([...localItems, ...remoteItems]);
}

function normalizeWishlist(items: unknown[]) {
  const seen = new Set<string>();
  const normalized: WishlistItem[] = [];

  items.forEach((item) => {
    if (!isWishlistItem(item) || seen.has(item.productId)) return;
    seen.add(item.productId);
    normalized.push(item);
  });

  return normalized.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WishlistItem>;
  return (
    typeof item.productId === "string" &&
    item.productId.length > 0 &&
    typeof item.createdAt === "string" &&
    Number.isFinite(Date.parse(item.createdAt))
  );
}
