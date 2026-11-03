import "server-only";
import { cache } from "react";
import { getActiveProducts, toMiniProduct } from "./catalog";
import { getShippingSettings } from "./orders";
import { cartMilestones } from "./rewards";

/** Everything the cart UI needs for photos, milestones and cross-sells. */
export const getCartCatalog = cache(async () => {
  const [products, shipping] = await Promise.all([getActiveProducts(), getShippingSettings()]);
  return {
    products: products.map(toMiniProduct),
    milestones: cartMilestones(shipping.freeAbove, shipping.rewards),
    rewards: shipping.rewards,
    codEnabled: shipping.codEnabled,
    shipping,
  };
});
