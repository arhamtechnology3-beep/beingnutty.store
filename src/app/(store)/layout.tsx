import { CartDrawerLoader } from "@/components/store/cart-drawer-loader";
import { FloatingActions } from "@/components/store/floating-actions";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { SmoothScroll } from "@/components/store/smooth-scroll";
import { getShippingSettings } from "@/lib/orders";
import { cartMilestones } from "@/lib/rewards";
import { formatINR } from "@/lib/utils";

// Cache HTML for 2 minutes so Hostinger (Mumbai) ↔ Supabase (Sydney) isn't hit on every click.
export const revalidate = 120;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const shipping = await getShippingSettings();
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
      <CartDrawerLoader
        milestones={cartMilestones(shipping.freeAbove, shipping.rewards)}
        rewards={shipping.rewards}
        codEnabled={shipping.codEnabled}
      />
      <FloatingActions />
    </>
  );
}
