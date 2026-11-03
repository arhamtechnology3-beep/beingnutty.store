import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { MiniProduct } from "./recommend";

const productInclude = {
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { position: "asc" } },
  reviews: { where: { approved: true }, select: { rating: true } },
} as const;

export const getActiveProducts = cache(async () =>
  db.product.findMany({
    where: { status: "ACTIVE" },
    include: productInclude,
    orderBy: { createdAt: "asc" },
  }),
);

export const getProductBySlug = cache(async (slug: string) =>
  db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      ...productInclude,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
      collections: { include: { collection: true } },
    },
  }),
);

export const getCollections = cache(async () =>
  db.collection.findMany({ where: { published: true }, orderBy: { position: "asc" } }),
);

export const getCollectionBySlug = cache(async (slug: string) =>
  db.collection.findFirst({
    where: { slug, published: true },
    include: {
      products: {
        where: { product: { status: "ACTIVE" } },
        orderBy: { position: "asc" },
        include: { product: { include: productInclude } },
      },
    },
  }),
);

const LOW_STOCK = 10;

export type StoreProduct = Awaited<ReturnType<typeof getActiveProducts>>[number];

/** Plain, serialisable shape for client components. */
/** A styled/serving shot for the card hover, rather than another photo of the can. */
function lifestyleImage(images: StoreProduct["images"]) {
  const shared = images.filter((i) => !i.variantId);
  const img = shared.find((i) => /styled|poured|lifestyle/.test(i.url)) ?? shared[1];
  return img ? { url: img.url, alt: img.alt } : null;
}

export function toCardProduct(p: StoreProduct) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    accentColor: p.accentColor ?? "#d08a3c",
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    hoverImage: lifestyleImage(p.images),
    rating: p.reviews.length
      ? { average: p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length, count: p.reviews.length }
      : null,
    tags: p.tags,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      available: !v.trackInventory || v.inventoryQty > 0,
      stockLeft: v.trackInventory && v.inventoryQty > 0 && v.inventoryQty <= LOW_STOCK ? v.inventoryQty : null,
    })),
  };
}

export type CardProduct = ReturnType<typeof toCardProduct>;

export function toMiniProduct(p: StoreProduct): MiniProduct {
  return {
    slug: p.slug,
    title: p.title,
    name: shortTitle(p.title),
    image: p.images[0]?.url ?? null,
    accentColor: p.accentColor ?? "#d08a3c",
    tags: p.tags,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      available: !v.trackInventory || v.inventoryQty > 0,
    })),
  };
}

const SYNONYMS: Record<string, string[]> = {
  kaju: ["cashew", "cashews"],
  badam: ["almond", "almonds"],
  pista: ["pistachio", "pistachios"],
  smoked: ["roasted", "roast"],
  mix: ["mixed", "trail", "combo"],
  raw: ["plain", "natural"],
};

function expand(word: string) {
  for (const [key, alts] of Object.entries(SYNONYMS)) {
    if (word === key || alts.includes(word)) return [key, ...alts];
  }
  return [word];
}

/** Every word (or a synonym) must appear somewhere in the product's text. Best matches on title first. */
export async function searchProducts(query: string, limit?: number) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const products = await getActiveProducts();
  const scored = products.flatMap((p) => {
    const title = p.title.toLowerCase();
    const text = [title, p.shortDescription, p.description, p.ingredients, p.category, ...p.tags].join(" ").toLowerCase();
    let score = 0;
    for (const w of words) {
      const forms = expand(w);
      if (!forms.some((f) => text.includes(f))) return [];
      if (forms.some((f) => title.includes(f))) score += 2;
    }
    return [{ p, score }];
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

/** Short label used on can artwork, e.g. "Smoked Kaju" from "Smoked Kaju — Smoked Cashews". */
export function shortTitle(title: string) {
  return title.split("—")[0].trim();
}
