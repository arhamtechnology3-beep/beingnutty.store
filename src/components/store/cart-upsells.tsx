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
      className="mt-2.5 inline-flex max-w-full items-start gap-1.5 rounded-full border border-[#3f5212]/15 bg-pista/18 px-3 py-1.5 text-left text-xs font-semibold leading-snug text-[#3f5212] transition-colors hover:bg-pista/32"
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
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-black tracking-tight">{title}</h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-roast/70">Add more</span>
      </div>
      <ul
        className={cn(
          "mt-4",
          layout === "rail"
            ? "-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none]"
            : "grid grid-cols-2 gap-4 md:grid-cols-4",
        )}
      >
        {picks.map((p) => {
          const v = firstAvailable(p)!;
          return (
            <li
              key={p.slug}
              className={cn(
                "flex flex-col rounded-[1.25rem] border border-line/50 bg-paper/80 p-2.5 shadow-[0_8px_24px_-20px_color-mix(in_oklab,var(--ink)_40%,transparent)]",
                layout === "rail" && "w-[9.5rem] shrink-0 snap-start",
              )}
            >
              <Link href={`/products/${p.slug}`} onClick={onNavigate} className="group block">
                <LineThumb image={p.image} accentColor={p.accentColor} sizes="160px" className="aspect-square w-full rounded-[0.95rem]" />
                <p className="mt-2.5 line-clamp-2 font-display text-sm font-bold leading-tight group-hover:text-roast">{p.name}</p>
              </Link>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                <p className="text-sm tabular-nums">
                  <span className="font-semibold">{formatINR(v.price)}</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-roast/75">{v.title}</span>
                </p>
                <button
                  type="button"
                  onClick={() => quickAdd(p)}
                  aria-label={`Add ${p.name} ${v.title} to cart`}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform hover:scale-110 active:scale-95"
                >
                  <Plus className="size-4" strokeWidth={2.25} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
