"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { cart } from "@/lib/cart-store";
import { firstAvailable, type MiniProduct } from "@/lib/recommend";
import type { Milestone } from "@/lib/rewards";
import { cn, formatINR } from "@/lib/utils";
import { LineThumb } from "./line-thumb";

/** Bundle of this product + complementary picks, added to the cart in one tap. */
export function BoughtTogether({ items, milestones }: { items: MiniProduct[]; milestones: Milestone[] }) {
  const [picked, setPicked] = useState(() => new Set(items.map((p) => p.slug)));
  const rows = items.flatMap((p) => {
    const v = firstAvailable(p);
    return v ? [{ p, v }] : [];
  });
  if (rows.length < 2) return null;

  const chosen = rows.filter((r) => picked.has(r.p.slug));
  const total = chosen.reduce((s, r) => s + r.v.price, 0);
  const was = chosen.reduce((s, r) => s + (r.v.compareAtPrice ?? r.v.price), 0);
  const unlocks = milestones.filter((m) => total >= m.at).at(-1);

  const toggle = (slug: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const addAll = () => {
    for (const { p, v } of chosen) {
      cart.add({ variantId: v.id, slug: p.slug, title: p.title, variantTitle: v.title, price: v.price, accentColor: p.accentColor, image: p.image });
    }
  };

  return (
    <section className="mt-20 rounded-[2rem] bg-paper p-5 sm:p-8 md:p-10" aria-labelledby="bought-together">
      <h2 id="bought-together" className="font-display text-3xl font-black tracking-tight md:text-4xl">
        Frequently bought together
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          {rows.map(({ p }, i) => (
            <Fragment key={p.slug}>
              {i > 0 ? <Plus className="size-5 shrink-0 text-roast" aria-hidden /> : null}
              <Link
                href={`/products/${p.slug}`}
                className={cn("min-w-0 flex-1 transition-opacity", !picked.has(p.slug) && "opacity-35")}
                aria-label={p.title}
              >
                <LineThumb image={p.image} accentColor={p.accentColor} sizes="(min-width: 1024px) 220px, 30vw" className="aspect-square w-full rounded-2xl" />
              </Link>
            </Fragment>
          ))}
        </div>

        <div>
          <ul className="space-y-2">
            {rows.map(({ p, v }, i) => (
              <li key={p.slug}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-cream">
                  <input type="checkbox" checked={picked.has(p.slug)} onChange={() => toggle(p.slug)} className="peer sr-only" />
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-caramel",
                      picked.has(p.slug) ? "border-ink bg-ink text-paper" : "border-line",
                    )}
                    aria-hidden
                  >
                    {picked.has(p.slug) ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">{i === 0 ? "This item: " : ""}</span>
                    {p.name} <span className="text-roast">· {v.title}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatINR(v.price)}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-sm text-roast">Total</span>
            <span className="font-display text-3xl font-black tabular-nums">{formatINR(total)}</span>
            {was > total ? <s className="text-roast/70 tabular-nums">{formatINR(was)}</s> : null}
          </div>
          {unlocks ? <p className="mt-1 text-sm font-semibold text-[#3f5212]">Unlocks {unlocks.label}</p> : null}
          <button
            type="button"
            disabled={!chosen.length}
            onClick={addAll}
            className="mt-4 w-full rounded-full bg-ink py-4 font-semibold text-paper transition-colors hover:bg-roast disabled:opacity-40"
          >
            {chosen.length > 1 ? `Add all ${chosen.length} to cart` : chosen.length ? "Add to cart" : "Select an item"}
          </button>
        </div>
      </div>
    </section>
  );
}
