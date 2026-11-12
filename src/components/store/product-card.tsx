"use client";

import { useState } from "react";
import { Check, Flame, Plus, Star } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { cart } from "@/lib/cart-store";
import { bulkSaving, grams, largestAvailable, pricePer100g } from "@/lib/recommend";
import { HardLink } from "./hard-link";
import { ProductStage } from "./product-stage";
import { WishlistButton } from "./wishlist-button";
import { cn, formatINR, savePercent } from "@/lib/utils";

function sizeSavePercent(
  variants: CardProduct["variants"],
  v: CardProduct["variants"][number],
) {
  const mrp = savePercent(v.price, v.compareAtPrice);
  const bulk = bulkSaving(variants, v)?.percent ?? 0;
  if (mrp || bulk) return Math.max(mrp, bulk);
  // Smaller packs often have no MRP cut — still show the % saved by stepping up size.
  const biggest = largestAvailable(variants);
  if (!biggest || biggest.id === v.id) return 0;
  return bulkSaving(variants, biggest)?.percent ?? 0;
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: CardProduct;
  priority?: boolean;
}) {
  const preferred = largestAvailable(product.variants);
  const [variantId, setVariantId] = useState(preferred?.id ?? product.variants[0]?.id);
  const [added, setAdded] = useState(false);
  const variant =
    product.variants.find((v) => v.id === variantId) ?? preferred ?? product.variants[0];
  const [name, subtitle = product.shortDescription ?? ""] = product.title
    .split(/\s*[—–-]\s*/)
    .map((s) => s.trim());

  if (!variant) return null;

  const mrpSave = savePercent(variant.price, variant.compareAtPrice);
  const bulk = bulkSaving(product.variants, variant);
  const per100 = pricePer100g(variant);
  const biggest = largestAvailable(product.variants);
  const biggestBulk = biggest ? bulkSaving(product.variants, biggest) : null;
  const selectedGrams = grams(variant.title);
  const biggestGrams = biggest ? grams(biggest.title) : null;
  const onSmaller =
    !!biggest &&
    !!selectedGrams &&
    !!biggestGrams &&
    selectedGrams < biggestGrams &&
    biggest.id !== variant.id &&
    !!biggestBulk;

  const href = `/products/${product.slug}`;
  const topSave = Math.max(
    ...product.variants.map((v) => sizeSavePercent(product.variants, v)),
    0,
  );

  const add = () => {
    cart.add({
      variantId: variant.id,
      slug: product.slug,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      accentColor: product.accentColor,
      image: product.image?.url ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-line/55 bg-paper p-1.5 shadow-[0_14px_32px_-26px_color-mix(in_oklab,var(--ink)_50%,transparent)] transition duration-500 ease-out-expo hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_28px_48px_-28px_color-mix(in_oklab,var(--ink)_42%,transparent)] sm:p-1.5">
      <div className="relative">
        <HardLink href={href} aria-label={product.title} className="block overflow-hidden rounded-[1.25rem]">
          <ProductStage
            slug={product.slug}
            label={name}
            accentColor={product.accentColor}
            image={product.image}
            hoverImage={product.hoverImage}
            sizes="(min-width: 1024px) 22vw, 45vw"
            preload={priority}
            className="aspect-[5/6]"
          />
        </HardLink>

        <div className="pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-3.25rem)] flex-wrap gap-1">
          {product.tags.includes("smoked") ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/88 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-paper backdrop-blur">
              <Flame className="size-3" aria-hidden />
              Smoked
            </span>
          ) : null}
          {topSave ? (
            <span className="rounded-full bg-pista px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink">
              Up to {topSave}% off
            </span>
          ) : null}
        </div>

        {product.rating ? (
          <span
            className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-paper/92 px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-sm backdrop-blur"
            aria-label={`Rated ${product.rating.average.toFixed(1)} out of 5 from ${product.rating.count} review${product.rating.count === 1 ? "" : "s"}`}
          >
            <Star className="size-3 fill-caramel text-caramel" aria-hidden />
            {product.rating.average.toFixed(1)}
            <span className="font-medium text-roast">({product.rating.count})</span>
          </span>
        ) : null}

        <WishlistButton
          className="absolute right-2 top-2 size-8 sm:size-9"
          item={{
            slug: product.slug,
            title: product.title,
            image: product.image?.url ?? null,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            accentColor: product.accentColor,
            variantId: variant.id,
            variantTitle: variant.title,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-2.5 sm:px-2">
        <h3 className="font-display text-[1.2rem] font-black leading-[0.95] tracking-tight sm:text-[1.35rem]">
          <HardLink href={href} className="hover:text-roast">
            {name}
          </HardLink>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-roast">{subtitle}</p>

        <div
          className="mt-2.5 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.min(product.variants.length, 3)}, minmax(0, 1fr))` }}
          role="radiogroup"
          aria-label={`${product.title} size`}
        >
          {product.variants.map((v) => {
            const selected = v.id === variant.id;
            const save = sizeSavePercent(product.variants, v);
            const isBiggest = biggest?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-xl border px-1 py-1.5 text-center transition",
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-line/70 bg-cream/60 text-ink hover:border-ink/30",
                  !v.available && "opacity-45",
                )}
              >
                <span className="block text-[11px] font-bold tabular-nums leading-none sm:text-xs">{v.title}</span>
                {save ? (
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      selected ? "bg-pista text-ink" : "bg-pista/30 text-[#3f5212]",
                    )}
                  >
                    Save {save}%
                  </span>
                ) : (
                  <span className={cn("mt-1 block text-[9px]", selected ? "text-paper/55" : "text-roast/65")}>
                    {isBiggest ? "Best value" : "Pack"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {onSmaller ? (
          <button
            type="button"
            onClick={() => setVariantId(biggest!.id)}
            className="mt-2 w-full rounded-xl bg-pista/20 px-2 py-1.5 text-left text-[11px] font-semibold leading-snug text-[#3f5212] transition hover:bg-pista/30"
          >
            {biggest!.title} saves {formatINR(biggestBulk!.amount)} ({biggestBulk!.percent}%)
          </button>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0 leading-tight">
            <p className="font-display text-lg font-black tabular-nums tracking-tight sm:text-xl">
              {formatINR(variant.price)}
            </p>
            <p className="mt-0.5 text-[10px] text-roast sm:text-[11px]">
              {variant.stockLeft ? (
                <span className="font-semibold text-[#b45309]">Only {variant.stockLeft} left</span>
              ) : bulk && !onSmaller ? (
                <span className="font-semibold text-[#3f5212]">
                  Save {formatINR(bulk.amount)} vs {bulk.vs}
                </span>
              ) : mrpSave ? (
                <>
                  <s className="opacity-65">{formatINR(variant.compareAtPrice!)}</s>
                  <span className="ml-1 font-semibold text-[#3f5212]">Save {mrpSave}%</span>
                </>
              ) : per100 ? (
                <span className="tabular-nums">{formatINR(per100)} / 100 g</span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            disabled={!variant.available}
            onClick={add}
            className={cn(
              "flex h-10 shrink-0 items-center justify-center gap-1 rounded-full px-3.5 text-sm font-semibold text-paper transition-all duration-300 disabled:opacity-40 sm:h-10",
              added ? "bg-[#3f6b2a]" : "bg-ink hover:bg-roast",
            )}
            aria-label={
              variant.available
                ? `Add ${product.title} ${variant.title} to cart`
                : `${product.title} ${variant.title} is sold out`
            }
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />}
            <span className="hidden sm:inline">{added ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
