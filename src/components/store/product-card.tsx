"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Flame, Plus, Star } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { cart } from "@/lib/cart-store";
import { bulkSaving } from "@/lib/recommend";
import { ProductStage } from "./product-stage";
import { WishlistButton } from "./wishlist-button";
import { cn, formatINR, savePercent } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: CardProduct;
  priority?: boolean;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [added, setAdded] = useState(false);
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const [name, subtitle = product.shortDescription ?? ""] = product.title
    .split("—")
    .map((s) => s.trim());

  if (!variant) return null;
  const mrpSave = savePercent(variant.price, variant.compareAtPrice);
  const bulk = mrpSave ? null : bulkSaving(product.variants, variant);
  const save = mrpSave || bulk?.percent;
  const href = `/products/${product.slug}`;

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
    <article className="group relative flex h-full flex-col rounded-[1.75rem] bg-paper p-1.5 ring-1 ring-line transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(42,26,16,0.45)] hover:ring-ink/15 sm:p-2">
      <div className="relative">
        <Link
          href={href}
          aria-label={product.title}
          className="block overflow-hidden rounded-[1.4rem]"
        >
          <ProductStage
            slug={product.slug}
            label={name}
            accentColor={product.accentColor}
            image={product.image}
            hoverImage={product.hoverImage}
            sizes="(min-width: 1024px) 22vw, 45vw"
            preload={priority}
            className="aspect-[4/5]"
          />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1 sm:left-3 sm:top-3">
          {save ? (
            <span
              className="rounded-full bg-pista px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink sm:px-2.5 sm:text-[11px]"
              title={
                bulk
                  ? `vs buying ${variant.title} at the ${bulk.vs} price`
                  : undefined
              }
            >
              Save {save}%
            </span>
          ) : null}
          {product.tags.includes("smoked") ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-paper backdrop-blur sm:px-2.5 sm:text-[11px]">
              <Flame className="size-3" aria-hidden />
              Smoked
            </span>
          ) : null}
        </div>
        {product.rating ? (
          <span
            className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2 py-1 text-[11px] font-bold tabular-nums shadow-sm backdrop-blur sm:bottom-3 sm:left-3 sm:text-xs"
            aria-label={`Rated ${product.rating.average.toFixed(1)} out of 5 from ${product.rating.count} review${product.rating.count === 1 ? "" : "s"}`}
          >
            <Star className="size-3.5 fill-caramel text-caramel" aria-hidden />
            {product.rating.average.toFixed(1)}
            <span className="font-medium text-roast">({product.rating.count})</span>
          </span>
        ) : null}
        <WishlistButton
          className="absolute right-2 top-2 size-9 sm:right-3 sm:top-3 sm:size-10"
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

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-2.5 sm:pb-2">
        <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">
          <Link href={href} className="line-clamp-1 hover:text-roast">
            {name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-roast sm:text-sm">
          {subtitle}
        </p>

        <div
          className="mt-3 flex rounded-full bg-cream p-1 ring-1 ring-inset ring-line"
          role="radiogroup"
          aria-label={`${product.title} size`}
        >
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={v.id === variant.id}
              onClick={() => setVariantId(v.id)}
              className={cn(
                "flex-1 rounded-full py-1 text-xs font-semibold transition",
                v.id === variant.id
                  ? "bg-paper text-ink shadow-[0_1px_4px_rgba(42,26,16,0.18)]"
                  : "text-roast hover:text-ink",
                !v.available && "line-through opacity-50",
              )}
            >
              {v.title}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0 leading-tight">
            <p className="text-base font-bold tabular-nums sm:text-lg">
              {formatINR(variant.price)}
            </p>
            <p className="h-4 text-xs text-roast">
              {variant.stockLeft ? (
                <span className="font-semibold text-[#b45309]">
                  Only {variant.stockLeft} left
                </span>
              ) : mrpSave ? (
                <s className="opacity-70">
                  {formatINR(variant.compareAtPrice!)}
                </s>
              ) : bulk ? (
                <span className="font-semibold text-[#3f6b2a]">
                  Save {formatINR(bulk.amount)} vs {bulk.vs}
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            disabled={!variant.available}
            onClick={add}
            className={cn(
              "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-paper transition-all duration-300 disabled:opacity-40 sm:h-11 lg:px-4",
              added ? "bg-[#3f6b2a]" : "bg-ink hover:bg-roast",
            )}
            aria-label={
              variant.available
                ? `Add ${product.title} ${variant.title} to cart`
                : `${product.title} ${variant.title} is sold out`
            }
          >
            {added ? <Check className="size-5" /> : <Plus className="size-5" />}
            <span className="hidden lg:inline">{added ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
