import "server-only";
import { db } from "./db";
import { absoluteUrl } from "./site";

export type OrderLineVisual = {
  image: string | null;
  imageAbsolute: string | null;
  accentColor: string;
};

/** Resolve product thumbnails for order lines (by variant). */
export async function visualsForOrderItems(
  items: { variantId: string | null }[],
): Promise<Map<string, OrderLineVisual>> {
  const ids = [...new Set(items.map((i) => i.variantId).filter(Boolean))] as string[];
  const map = new Map<string, OrderLineVisual>();
  if (!ids.length) return map;

  const variants = await db.productVariant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      product: {
        select: {
          accentColor: true,
          images: { orderBy: { position: "asc" }, select: { url: true, variantId: true } },
        },
      },
    },
  });

  for (const v of variants) {
    const imgs = v.product.images;
    const match = imgs.find((i) => i.variantId === v.id) ?? imgs.find((i) => !i.variantId) ?? imgs[0];
    const url = match?.url ?? null;
    const absolute = url ? (url.startsWith("http") ? url : absoluteUrl(url)) : null;
    map.set(v.id, {
      image: url,
      imageAbsolute: absolute,
      accentColor: v.product.accentColor ?? "#d08a3c",
    });
  }
  return map;
}
