import { CartDrawer } from "@/components/store/cart-drawer";
import { FloatingActions } from "@/components/store/floating-actions";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { SmoothScroll } from "@/components/store/smooth-scroll";
import { getCartCatalog } from "@/lib/cart-catalog";
import { formatINR } from "@/lib/utils";

// Store pages need the DB at request time; don't fail Hostinger builds when env isn't injected yet.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { shipping, ...catalog } = await getCartCatalog();
  const topReward = shipping.rewards.at(-1);
  const announcements = [
    shipping.freeAbove ? `Free delivery on orders above ${formatINR(shipping.freeAbove)}` : "Delivered across India",
    ...(topReward ? [`Save up to ${topReward.percent}% — rewards unlock automatically in your cart`] : []),
    ...(shipping.codEnabled ? ["Cash on delivery available"] : []),
    "Packed fresh in air-tight cans · Ships in 1–2 days",
  ];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Header announcements={announcements} />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer {...catalog} />
      <FloatingActions />
    </>
  );
}
