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
  icon?: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20.5 4.2 12.7a4.6 4.6 0 0 1 6.5-6.5l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 6.5z" />
    </svg>
  );
}

export function WishlistButton({
  productId,
  className,
  activeLabel = "Saved",
  inactiveLabel = "Wishlist",
  icon = false,
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
      {icon ? <HeartIcon filled={active} /> : active ? activeLabel : inactiveLabel}
    </button>
  );
}
