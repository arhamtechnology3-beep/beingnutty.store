/** Cart reward tiers: spend `at` (paise) or more to get `percent` off the subtotal. Shared by server pricing and the cart UI. */
export type RewardTier = { at: number; percent: number };

export const DEFAULT_REWARDS: RewardTier[] = [
  { at: 99900, percent: 5 },
  { at: 149900, percent: 10 },
];

export function activeTiers(tiers: RewardTier[]) {
  return tiers.filter((t) => t.at > 0 && t.percent > 0).sort((a, b) => a.at - b.at);
}

export function rewardFor(subtotal: number, tiers: RewardTier[]) {
  const tier = activeTiers(tiers).filter((t) => subtotal >= t.at).at(-1);
  return tier ? { percent: tier.percent, discount: Math.round((subtotal * tier.percent) / 100) } : { percent: 0, discount: 0 };
}

export type Milestone = { at: number; kind: "shipping" | "percent"; label: string; short: string };

export function cartMilestones(freeAbove: number, tiers: RewardTier[]): Milestone[] {
  return [
    ...(freeAbove > 0 ? [{ at: freeAbove, kind: "shipping" as const, label: "FREE delivery", short: "Free delivery" }] : []),
    ...activeTiers(tiers).map((t) => ({ at: t.at, kind: "percent" as const, label: `${t.percent}% OFF your order`, short: `${t.percent}% off` })),
  ].sort((a, b) => a.at - b.at);
}
