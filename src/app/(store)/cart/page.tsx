import type { Metadata } from "next";
import { getCartCatalog } from "@/lib/cart-catalog";
import { RecentlyViewed } from "@/components/store/recently-viewed";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function CartPage() {
  const { products, milestones, rewards } = await getCartCatalog();
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-28 pt-28 md:px-10 md:pt-32">
      <h1 className="font-display text-5xl font-black tracking-tight md:text-6xl">Your cart</h1>
      <CartView products={products} milestones={milestones} rewards={rewards} />
      <RecentlyViewed title="You recently looked at" />
    </div>
  );
}
