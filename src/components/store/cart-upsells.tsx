"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { cart, type CartLine } from "@/lib/cart-store";
import { firstAvailable, recommend, sizeUpgrade, type MiniProduct } from "@/lib/recommend";
import { cn, formatINR } from "@/lib/utils";
import { LineThumb } from "./line-thumb";

export function quickAdd(p: MiniProduct) {
  const v = firstAvailable(p);
  if (!v) return;
  cart.add({
    variantId: v.id,
    slug: p.slug,
    title: p.title,
    variantTitle: v.title,
    price: v.price,
    accentColor: p.accentColor,
    image: p.image,
  });
}

/** "Upgrade to 400g" nudge for a cart line when a bigger, better-value size exists. */
export function UpgradeOffer({ line, product }: { line: CartLine; product?: MiniProduct }) {
  const up = sizeUpgrade(product, line.variantId);
  if (!up) return null;
  return (
    <button
      type="button"
      onClick={() => cart.swapVariant(line.variantId, { variantId: up.variant.id, variantTitle: up.variant.title, price: up.variant.price })}
      className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-2xl bg-pista/20 px-3 py-1.5 text-left text-xs font-semibold leading-snug text-[#3f5212] transition-colors hover:bg-pista/35"
    >
      <ArrowUpRight className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        Upgrade to {up.variant.title} for +{formatINR(up.extra)}
        {up.savePerGram >= 3 ? <span className="font-medium"> · {up.savePerGram}% better value</span> : null}
      </span>
    </button>
  );
}

/** Cross-sell rail: complementary products not already in the cart, with one-tap add. */
export function PairsWell({
  products,
  lines,
  title = "Pairs well with your cart",
  layout = "rail",
  limit = 4,
  onNavigate,
}: {
  products: MiniProduct[];
  lines: CartLine[];
  title?: string;
  layout?: "rail" | "grid";
  limit?: number;
  onNavigate?: () => void;
}) {
  const picks = recommend(
    products,
    lines.map((l) => l.slug),
    limit,
  );
  if (!picks.length) return null;

  return (
    <section aria-label={title}>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul
        className={cn(
          "mt-3",
          layout === "rail"
            ? "-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none]"
            : "grid grid-cols-2 gap-4 md:grid-cols-4",
        )}
      >
        {picks.map((p) => {
          const v = firstAvailable(p)!;
          return (
            <li key={p.slug} className={cn("flex flex-col rounded-2xl bg-cream p-2.5", layout === "rail" && "w-36 shrink-0 snap-start")}>
              <Link href={`/products/${p.slug}`} onClick={onNavigate} className="group block">
                <LineThumb image={p.image} accentColor={p.accentColor} sizes="160px" className="aspect-square w-full rounded-xl" />
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight group-hover:underline">{p.name}</p>
              </Link>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <p className="text-sm tabular-nums">
                  <span className="font-semibold">{formatINR(v.price)}</span>
                  <span className="block text-[11px] text-roast">{v.title}</span>
                </p>
                <button
                  type="button"
                  onClick={() => quickAdd(p)}
                  aria-label={`Add ${p.name} ${v.title} to cart`}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform hover:scale-110"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
