"use client";

import { useEffect, useState } from "react";
import {
  isWishlisted,
  toggleWishlistProduct,
  WISHLIST_CHANGE_EVENT,
} from "@/lib/wishlist";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { saveRemoteWishlist } from "@/lib/supabase/wishlist-sync";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function WishlistButton({
  productId,
  className,
  activeLabel = "Saved",
  inactiveLabel = "Wishlist",
}: WishlistButtonProps) {
  const [active, setActive] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "error">("idle");

  useEffect(() => {
    function syncStateFromStorage() {
      setActive(isWishlisted(productId));
    }

    syncStateFromStorage();
    window.addEventListener(WISHLIST_CHANGE_EVENT, syncStateFromStorage);
    window.addEventListener("storage", syncStateFromStorage);

    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, syncStateFromStorage);
      window.removeEventListener("storage", syncStateFromStorage);
    };
  }, [productId]);

  async function handleToggle() {
    const nextWishlist = toggleWishlistProduct(productId);
    setActive(nextWishlist.isWishlisted);

    if (!isSupabaseConfigured()) return;

    try {
      setSyncState("syncing");
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setSyncState("idle");
        return;
      }

      await saveRemoteWishlist(supabase, data.session.user.id, nextWishlist.items);
      setSyncState("idle");
    } catch {
      setSyncState("error");
    }
  }

  return (
    <button
      className={className}
      type="button"
      aria-pressed={active}
      aria-label={`${active ? "Remove from" : "Add to"} wishlist`}
      title={syncState === "error" ? "Saved on this device. Sign in again to sync." : undefined}
      onClick={handleToggle}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
