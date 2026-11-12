/**
 * Commercial keywords that map to Being Nutty collection or product pages.
 * Includes SEO collection titles plus extra page-1 style queries (India dry fruits SERPs).
 */

export type KeywordLink = { label: string; href: string };

/** Extra ranking phrases → associated URL (collection or product). */
const EXTRA: KeywordLink[] = [
  { label: "buy dry fruits online", href: "/collections/dry-fruits" },
  { label: "dry fruits online India", href: "/collections/dry-fruits" },
  { label: "premium dry fruits", href: "/collections/premium-dry-fruits" },
  { label: "buy cashews online", href: "/collections/buy-cashews-online" },
  { label: "kaju online", href: "/collections/buy-cashews-online" },
  { label: "whole cashews", href: "/collections/whole-cashews" },
  { label: "raw cashews", href: "/collections/raw-cashews" },
  { label: "smoked cashews", href: "/collections/smoked-cashews" },
  { label: "roasted salted cashews", href: "/products/roasted-kaju-cashews" },
  { label: "buy almonds online", href: "/collections/buy-almonds-online" },
  { label: "badam online", href: "/collections/buy-almonds-online" },
  { label: "California almonds", href: "/collections/california-almonds" },
  { label: "raw almonds", href: "/collections/raw-almonds" },
  { label: "smoked almonds", href: "/collections/smoked-almonds" },
  { label: "roasted salted almonds", href: "/products/roasted-badam-almonds" },
  { label: "buy pistachios online", href: "/collections/buy-pistachios-online" },
  { label: "pista online", href: "/collections/buy-pistachios-online" },
  { label: "roasted salted pistachios", href: "/collections/roasted-salted-pistachios" },
  { label: "smoked pistachios", href: "/collections/smoked-pistachios" },
  { label: "raw pistachios", href: "/collections/raw-pistachios" },
  { label: "salted nuts", href: "/collections/salted-nuts" },
  { label: "roasted nuts online", href: "/collections/roasted-nuts-online" },
  { label: "smoked nuts", href: "/collections/roasted-nuts" },
  { label: "raw nuts", href: "/collections/raw-nuts" },
  { label: "unsalted nuts", href: "/collections/unsalted-nuts" },
  { label: "dry fruit mix", href: "/collections/mixes" },
  { label: "trail mix", href: "/collections/trail-mix" },
  { label: "3 mix nuts", href: "/collections/three-mix-nuts" },
  { label: "smoked mix nuts", href: "/collections/smoked-mix-nuts" },
  { label: "kaju badam pista", href: "/collections/kaju-badam-pista" },
  { label: "nuts in cans", href: "/collections/nuts-in-cans" },
  { label: "ready to eat nuts", href: "/collections/ready-to-eat-nuts" },
  { label: "healthy nut snacks", href: "/collections/healthy-nut-snacks" },
  { label: "protein rich nuts", href: "/collections/protein-rich-nuts" },
  { label: "nuts for mithai", href: "/collections/nuts-for-mithai" },
  { label: "Diwali dry fruits", href: "/collections/diwali-dry-fruits" },
  { label: "dry fruit gift pack", href: "/collections/dry-fruit-gift-pack" },
  { label: "corporate dry fruit gifts", href: "/collections/corporate-dry-fruit-gifts" },
  { label: "dates khajur", href: "/collections/dates-khajur" },
  { label: "buy dates online", href: "/collections/dates-khajur" },
  { label: "best cashews", href: "/collections/best-cashews" },
  { label: "best almonds", href: "/collections/best-almonds" },
  { label: "Kaju whole cashews", href: "/products/kaju-cashews" },
  { label: "Badam whole almonds", href: "/products/badam-almonds" },
  { label: "Pista pistachios", href: "/products/pista-pistachios" },
  { label: "Smoked Kaju", href: "/products/roasted-kaju-cashews" },
  { label: "Smoked Badam", href: "/products/roasted-badam-almonds" },
  { label: "Smoked Pista", href: "/products/roasted-pista-pistachios" },
  { label: "3 Mix Nuts can", href: "/products/mix-dry-fruits" },
  { label: "Smoked Salted 3 Mix", href: "/products/roasted-mix-dry-fruits" },
];

export function buildRankingKeywords(input: {
  collections: { title: string; slug: string }[];
  products: { title: string; slug: string }[];
}): KeywordLink[] {
  const seen = new Set<string>();
  const out: KeywordLink[] = [];

  const push = (label: string, href: string) => {
    const key = label.toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ label: label.trim(), href });
  };

  for (const c of input.collections) push(c.title, `/collections/${c.slug}`);
  for (const p of input.products) {
    const short = p.title.split("—")[0]?.trim() || p.title;
    push(short, `/products/${p.slug}`);
    push(p.title.replace(/\s+/g, " ").trim(), `/products/${p.slug}`);
  }
  for (const k of EXTRA) push(k.label, k.href);

  return out;
}

/** Split keywords into N rows for multi-line marquees. */
export function chunkKeywords(keywords: KeywordLink[], rows = 4) {
  const buckets: KeywordLink[][] = Array.from({ length: rows }, () => []);
  keywords.forEach((k, i) => buckets[i % rows].push(k));
  // Ensure each row has enough items to loop smoothly
  return buckets.map((row) => (row.length < 6 ? [...row, ...row, ...row] : row));
}
