"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { cart } from "@/lib/cart-store";
import { bulkSaving, pricePer100g } from "@/lib/recommend";
import { cn, formatINR, savePercent } from "@/lib/utils";
import { selectVariant } from "@/lib/variant-store";
import { LineThumb } from "./line-thumb";
import { ShareButton } from "./share-button";
import { WishlistButton } from "./wishlist-button";

type Variant = CardProduct["variants"][number] & { packaging: string | null };

/** Preselects the size from `?variant=SKU` (the URLs used in Product structured data). Render inside <Suspense>. */
export function BuyBoxFromUrl(
  props: Omit<ComponentProps<typeof BuyBox>, "initialSku">,
) {
  const sku = useSearchParams().get("variant") ?? undefined;
  return <BuyBox key={sku} {...props} initialSku={sku} />;
}

export function BuyBox({
  product,
  variants,
  variantImages,
  initialSku,
}: {
  product: Pick<
    CardProduct,
    "slug" | "title" | "accentColor" | "image" | "shortDescription"
  >;
  variants: Variant[];
  /** Photo to use for each size in the cart and sticky bar. */
  variantImages?: Record<string, string>;
  initialSku?: string;
}) {
  const [variantId, setVariantIdState] = useState(
    (variants.find((v) => v.sku === initialSku) ?? variants[0]).id,
  );
  const [added, setAdded] = useState(false);
  const setVariantId = (id: string) => {
    setVariantIdState(id);
    selectVariant(product.slug, id);
  };
  useEffect(() => {
    selectVariant(product.slug, variantId);
    // Only on mount: later changes go through setVariantId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [qty, setQty] = useState(1);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const mrpSave = savePercent(variant.price, variant.compareAtPrice);
  const bulk = bulkSaving(variants, variant);
  const save = mrpSave || bulk?.percent;
  const per100g = pricePer100g(variant);
  const { ref: stickyRef, visible: stickyVisible } = useStickyBar();

  const image = variantImages?.[variant.id] ?? product.image?.url ?? null;

  const add = () => {
    cart.add(
      {
        variantId: variant.id,
        slug: product.slug,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        accentColor: product.accentColor,
        image,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-4xl font-black tabular-nums">
          {formatINR(variant.price)}
        </span>
        {mrpSave ? (
          <s className="text-lg text-roast/70">
            {formatINR(variant.compareAtPrice!)}
          </s>
        ) : null}
        {save ? (
          <span className="rounded-full bg-pista/25 px-2.5 py-0.5 text-sm font-bold text-[#3f5212]">
            Save {save}%
          </span>
        ) : null}
        <span className="text-sm text-roast">incl. of all taxes</span>
      </p>
      {per100g || bulk ? (
        <p className="mt-2 text-sm text-roast">
          {per100g ? <span>{formatINR(per100g)} per 100 g</span> : null}
          {per100g && bulk ? <span aria-hidden> · </span> : null}
          {bulk ? (
            <span className="font-semibold text-[#3f5212]">
              {formatINR(bulk.amount)} less than {variant.title} at the{" "}
              {bulk.vs} price
            </span>
          ) : null}
        </p>
      ) : null}

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold uppercase tracking-[0.2em] text-roast">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {variants.map((v) => {
            const tag =
              savePercent(v.price, v.compareAtPrice) ||
              bulkSaving(variants, v)?.percent;
            return (
              <label
                key={v.id}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 px-5 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel",
                  v.id === variant.id
                    ? "border-ink bg-ink text-paper"
                    : "border-line hover:border-ink",
                  !v.available && "opacity-50",
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variant.id}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                <span className="block font-semibold">{v.title}</span>
                {v.packaging ? (
                  <span className="block text-xs opacity-75">
                    {v.packaging}
                  </span>
                ) : null}
                {tag ? (
                  <span className="absolute -right-2 -top-2.5 rounded-full bg-pista px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                    −{tag}%
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {variant.stockLeft ? (
        <p className="mt-4 text-sm font-semibold text-[#b45309]">
          Hurry — only {variant.stockLeft} left in this size.
        </p>
      ) : null}

      <div ref={stickyRef} className="mt-6 flex gap-3">
        <div className="flex items-center rounded-full border-2 border-line">
          <button
            type="button"
            className="grid size-12 place-items-center"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span
            className="w-8 text-center font-semibold tabular-nums"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            className="grid size-12 place-items-center"
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={!variant.available}
          onClick={add}
          className="btn-shine flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-paper transition-colors hover:bg-roast disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!variant.available ? (
            "Sold out"
          ) : added ? (
            <>
              <Check className="size-5" aria-hidden /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="size-5" aria-hidden /> Add to cart —{" "}
              {formatINR(variant.price * qty)}
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <WishlistButton
          className="border border-line bg-transparent shadow-none"
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
        <ShareButton
          title={product.title}
          text={`${product.title} from Being Nutty`}
        />
      </div>

      <div
        aria-hidden={!stickyVisible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_40px_-24px_rgba(42,26,16,0.35)] backdrop-blur-xl transition-transform duration-500 ease-out-expo",
          stickyVisible
            ? "translate-y-0"
            : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-2 px-4 md:flex-nowrap md:gap-5 md:px-10">
          <LineThumb
            image={image}
            accentColor={product.accentColor}
            sizes="56px"
            className="hidden size-14 shrink-0 rounded-xl md:block"
          />
          <div className="flex min-w-0 basis-full items-baseline justify-between gap-3 md:block md:flex-1 md:basis-auto">
            <p className="truncate text-sm font-semibold md:text-base">
              {product.title.split("—")[0].trim()}
            </p>
            <p className="shrink-0 text-sm text-roast">
              <span className="font-semibold text-ink">
                {formatINR(variant.price)}
              </span>
              {mrpSave ? (
                <s className="ml-2 text-roast/70">
                  {formatINR(variant.compareAtPrice!)}
                </s>
              ) : null}
              {save ? (
                <span className="ml-2 font-semibold text-[#3f5212]">
                  Save {save}%
                </span>
              ) : null}
            </p>
          </div>
          {variants.length > 1 ? (
            <div
              className="flex flex-1 items-center gap-1 rounded-full bg-cream p-1 ring-1 ring-inset ring-line md:flex-none md:gap-2 md:bg-transparent md:p-0 md:ring-0"
              role="radiogroup"
              aria-label="Size"
            >
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={v.id === variant.id}
                  tabIndex={stickyVisible ? 0 : -1}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "flex-1 rounded-full border-2 px-3 py-2 text-sm font-semibold transition-colors md:flex-none md:px-4",
                    v.id === variant.id
                      ? "border-ink bg-ink text-paper"
                      : "border-transparent md:border-line md:hover:border-ink",
                    !v.available && "opacity-50",
                  )}
                >
                  {v.title}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            tabIndex={stickyVisible ? 0 : -1}
            disabled={!variant.available}
            onClick={add}
            className={cn(
              "btn-shine flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-roast disabled:opacity-50 md:flex-none md:px-8 md:text-base",
              stickyVisible &&
                variant.available &&
                !added &&
                "animate-[attention_2.2s_ease-out_infinite]",
            )}
          >
            {!variant.available ? (
              "Sold out"
            ) : added ? (
              <>
                <Check className="size-4" aria-hidden /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" aria-hidden /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Shows the bottom bar once the main add-to-cart row has scrolled above the viewport. */
function useStickyBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The top margin treats the strip behind the fixed header as off-screen.
    const io = new IntersectionObserver(
      ([entry]) =>
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 100),
      { rootMargin: "-90px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) root.dataset.stickyBar = "";
    else delete root.dataset.stickyBar;
    return () => {
      delete root.dataset.stickyBar;
    };
  }, [visible]);

  return { ref, visible };
}
