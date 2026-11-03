import type { Metadata } from "next";
import { StorePage } from "@/components/store/fields";
import { WishlistView } from "./wishlist-view";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <StorePage title="Your wishlist" intro="Saved on this device. Add them to your cart whenever you're ready." width="max-w-[1200px]">
      <WishlistView />
    </StorePage>
  );
}
