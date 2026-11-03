"use client";

import { Heart } from "lucide-react";
import { useWishlist, wishlistStore, type SavedProduct } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function WishlistButton({ item, className }: { item: SavedProduct; className?: string }) {
  const saved = useWishlist().some((i) => i.slug === item.slug);
  return (
    <button
      type="button"
      onClick={() => wishlistStore.toggle(item)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`}
      className={cn(
        "grid size-11 place-items-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-110",
        className,
      )}
    >
      <Heart className={cn("size-5 transition-colors", saved && "fill-[#c2410c] text-[#c2410c]")} />
    </button>
  );
}
