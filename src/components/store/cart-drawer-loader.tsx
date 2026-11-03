"use client";

import { useEffect, useState } from "react";
import { CartDrawer, type CartCatalog } from "./cart-drawer";
import type { Milestone, RewardTier } from "@/lib/rewards";

type Props = {
  milestones: Milestone[];
  rewards: RewardTier[];
  codEnabled: boolean;
};

const empty: CartCatalog = { products: [], milestones: [], rewards: [], codEnabled: true };

/** Loads product thumbs / upsells after paint so page HTML isn't blocked by the full catalog. */
export function CartDrawerLoader({ milestones, rewards, codEnabled }: Props) {
  const [catalog, setCatalog] = useState<CartCatalog>({
    ...empty,
    milestones,
    rewards,
    codEnabled,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart-catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CartCatalog | null) => {
        if (!cancelled && data?.products) {
          setCatalog({
            products: data.products,
            milestones: data.milestones ?? milestones,
            rewards: data.rewards ?? rewards,
            codEnabled: data.codEnabled ?? codEnabled,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [milestones, rewards, codEnabled]);

  return <CartDrawer {...catalog} />;
}
