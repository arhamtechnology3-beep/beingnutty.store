/** Lightweight product shape for cart cross-sells (safe to send to every page). */
export type MiniProduct = {
  slug: string;
  title: string;
  name: string;
  image: string | null;
  accentColor: string;
  tags: string[];
  variants: { id: string; title: string; price: number; compareAtPrice: number | null; available: boolean }[];
};

const NUTS = ["kaju", "badam", "pista", "mix"];
const nutOf = (p: MiniProduct) => NUTS.find((n) => p.tags.includes(n));
const styleOf = (p: MiniProduct) => (p.tags.includes("smoked") ? "smoked" : "raw");

/**
 * Ranks products that complement `owned`: the other style of a nut they already have first
 * (raw kaju → smoked kaju), then nuts they don't have yet, then a mix if they have none.
 */
export function recommend(all: MiniProduct[], owned: string[], limit = 4) {
  const have = all.filter((p) => owned.includes(p.slug));
  const nuts = new Set(have.map(nutOf));
  const styles = new Set(have.map(styleOf));
  return all
    .filter((p) => !owned.includes(p.slug) && p.variants.some((v) => v.available))
    .map((p, i) => {
      const nut = nutOf(p);
      let score = 0;
      if (nuts.has(nut) && !have.some((h) => nutOf(h) === nut && styleOf(h) === styleOf(p))) score += 3;
      if (!nuts.has(nut)) score += nut === "mix" ? 2.5 : 2;
      if (!styles.has(styleOf(p))) score += 1;
      return { p, score, i };
    })
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.p);
}

export function firstAvailable(p: MiniProduct) {
  return p.variants.find((v) => v.available) ?? null;
}

/** "250g" → 250, "1 kg" → 1000. */
export function grams(title: string) {
  const m = title.match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
  if (!m) return null;
  return Number(m[1]) * (m[2].toLowerCase() === "kg" ? 1000 : 1);
}

type Priced = { title: string; price: number };

/**
 * What a bigger size saves versus buying the same weight at the smallest size's price per gram.
 * `sameWeight` is that comparison price, in paise rounded to the rupee.
 */
export function bulkSaving(variants: Priced[], variant: Priced) {
  const g = grams(variant.title);
  if (!g) return null;
  const base = variants
    .map((v) => ({ v, g: grams(v.title) }))
    .filter((x): x is { v: Priced; g: number } => !!x.g && x.g < g)
    .sort((a, b) => a.g - b.g)[0];
  if (!base) return null;
  const sameWeight = Math.round(((base.v.price / base.g) * g) / 100) * 100;
  const amount = sameWeight - variant.price;
  const percent = Math.round((amount / sameWeight) * 100);
  return percent >= 2 ? { amount, percent, sameWeight, vs: base.v.title } : null;
}

/** Unit sale price per 100 g, in paise rounded to the rupee. */
export function pricePer100g(variant: Priced) {
  const g = grams(variant.title);
  return g ? Math.round(variant.price / g) * 100 : null;
}

/** A bigger size of the same product that's cheaper per gram, with the % saved per gram. */
export function sizeUpgrade(p: MiniProduct | undefined, variantId: string) {
  const current = p?.variants.find((v) => v.id === variantId);
  const g = current && grams(current.title);
  if (!p || !current || !g) return null;
  const bigger = p.variants
    .filter((v) => v.available && v.id !== variantId)
    .map((v) => ({ v, g: grams(v.title) }))
    .filter((x): x is { v: MiniProduct["variants"][number]; g: number } => !!x.g && x.g > g)
    .sort((a, b) => a.g - b.g)[0];
  if (!bigger) return null;
  const savePerGram = Math.round((1 - bigger.v.price / bigger.g / (current.price / g)) * 100);
  return { variant: bigger.v, extra: bigger.v.price - current.price, savePerGram };
}
