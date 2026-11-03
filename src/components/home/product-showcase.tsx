"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "raw", label: "Raw" },
  { key: "smoked", label: "Smoked" },
  { key: "mix", label: "Mixes" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function ProductShowcase({ products }: { products: CardProduct[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = filter === "all" ? products : products.filter((p) => p.tags.includes(filter));

  return (
    <section aria-labelledby="range-title" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-36">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-roast">The range</p>
          <h2 id="range-title" className="mt-3 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
            Pick your
            <br />
            <span className="italic text-caramel">kind of nutty.</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter products">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                filter === f.key ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.ul layout className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={p} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <div className="mt-16 text-center">
        <a href="/collections/dry-fruits" className="inline-block rounded-full bg-ink px-8 py-4 font-semibold text-paper transition-colors hover:bg-roast">
          View all products
        </a>
      </div>
    </section>
  );
}
