"use client";

import { useMemo, useState } from "react";
import type { CardProduct } from "@/lib/catalog";
import { cn, savePercent } from "@/lib/utils";
import { ProductCard } from "./product-card";

const STYLES = [
  { key: "raw", label: "Raw" },
  { key: "smoked", label: "Smoked" },
];
const NUTS = [
  { key: "kaju", label: "Kaju" },
  { key: "badam", label: "Badam" },
  { key: "pista", label: "Pista" },
  { key: "mix", label: "Mixes" },
];
const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  savings: "Biggest savings",
} as const;
type Sort = keyof typeof SORTS;

const from = (p: CardProduct) => Math.min(...p.variants.map((v) => v.price));
const bestSave = (p: CardProduct) => Math.max(...p.variants.map((v) => savePercent(v.price, v.compareAtPrice)));

export function ProductGrid({ products }: { products: CardProduct[] }) {
  const [style, setStyle] = useState<string | null>(null);
  const [nut, setNut] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("featured");

  const styles = STYLES.filter((s) => products.some((p) => p.tags.includes(s.key)));
  const nuts = NUTS.filter((n) => products.some((p) => p.tags.includes(n.key)));

  const shown = useMemo(() => {
    const list = products.filter((p) => (!style || p.tags.includes(style)) && (!nut || p.tags.includes(nut)));
    if (sort === "price-asc") list.sort((a, b) => from(a) - from(b));
    if (sort === "price-desc") list.sort((a, b) => from(b) - from(a));
    if (sort === "savings") list.sort((a, b) => bestSave(b) - bestSave(a));
    return list;
  }, [products, style, nut, sort]);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {styles.length > 1 ? <Chips label="Style" options={styles} value={style} onChange={setStyle} /> : null}
          {nuts.length > 1 ? <Chips label="Nut" options={nuts} value={nut} onChange={setNut} /> : null}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span className="shrink-0 text-roast">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border-2 border-line bg-paper px-4 py-2 font-semibold focus:border-ink focus:outline-none"
          >
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-6 text-sm text-roast" aria-live="polite">
        {shown.length} product{shown.length === 1 ? "" : "s"}
      </p>
      {shown.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {shown.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-[2rem] bg-paper p-10 text-center">
          <p className="font-display text-2xl font-bold">No products match those filters.</p>
          <button
            type="button"
            onClick={() => {
              setStyle(null);
              setNut(null);
            }}
            className="mt-4 text-sm font-semibold underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.2em] text-roast">{label}</span>
      {[{ key: null, label: "All" }, ...options].map((o) => (
        <button
          key={o.key ?? "all"}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            value === o.key ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
