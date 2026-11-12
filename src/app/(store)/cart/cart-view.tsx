"use client";

import Link from "next/link";
import { ArrowRight, Lock, Minus, Plus, Trash2 } from "lucide-react";
import { CartMilestones } from "@/components/store/cart-milestones";
import { PairsWell, UpgradeOffer } from "@/components/store/cart-upsells";
import type { CartCatalog } from "@/components/store/cart-drawer";
import { LineThumb } from "@/components/store/line-thumb";
import { cart, cartTotals, useCartLines } from "@/lib/cart-store";
import { rewardFor } from "@/lib/rewards";
import { formatINR } from "@/lib/utils";

export function CartView({ products, milestones, rewards }: Omit<CartCatalog, "codEnabled">) {
  const lines = useCartLines();
  const { subtotal } = cartTotals(lines);
  const reward = rewardFor(subtotal, rewards);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const total = subtotal - reward.discount;

  if (lines.length === 0) {
    return (
      <div className="mt-10">
        <div className="grain rounded-[2rem] border border-line/60 bg-[linear-gradient(160deg,var(--paper),color-mix(in_oklab,var(--caramel)_10%,var(--cream)))] px-8 py-16 text-center md:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-roast/80">Your pantry</p>
          <p className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">Nothing nutty here yet.</p>
          <p className="mx-auto mt-4 max-w-md text-roast">Start with a bestseller — sealed cans, ready to snack.</p>
          <Link
            href="/collections/dry-fruits"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-paper transition-colors hover:bg-roast"
          >
            Shop dry fruits
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-12">
          <PairsWell products={products} lines={lines} title="Bestsellers" layout="grid" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12 [&>*]:min-w-0">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li
            key={line.variantId}
            className="flex gap-4 rounded-[1.5rem] border border-line/55 bg-paper/80 p-4 shadow-[0_12px_32px_-24px_color-mix(in_oklab,var(--ink)_45%,transparent)] sm:gap-5 sm:p-5"
          >
            <Link href={`/products/${line.slug}`} tabIndex={-1} aria-hidden className="shrink-0">
              <LineThumb image={line.image} accentColor={line.accentColor} className="size-20 sm:size-24" sizes="96px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <Link href={`/products/${line.slug}`} className="font-display text-xl font-bold leading-tight tracking-tight hover:text-roast">
                  {line.title}
                </Link>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-roast/75">{line.variantTitle}</p>
                <p className="mt-1 text-sm text-roast tabular-nums">{formatINR(line.price)} each</p>
                <UpgradeOffer line={line} product={bySlug.get(line.slug)} />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center rounded-full border border-line bg-cream/80 p-0.5">
                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full transition-colors hover:bg-paper"
                    onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
                    aria-label={`Decrease ${line.title} quantity`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full transition-colors hover:bg-paper"
                    onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
                    aria-label={`Increase ${line.title} quantity`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => cart.remove(line.variantId)}
                  className="grid size-10 place-items-center rounded-full text-roast transition-colors hover:bg-cream hover:text-ink"
                  aria-label={`Remove ${line.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
                <p className="ml-auto min-w-16 text-right font-display text-lg font-bold tabular-nums">
                  {formatINR(line.price * line.quantity)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="grain overflow-hidden rounded-[1.75rem] border border-line/55 bg-[linear-gradient(165deg,var(--paper),color-mix(in_oklab,var(--caramel)_10%,var(--cream)))] p-6 shadow-[0_20px_48px_-28px_color-mix(in_oklab,var(--ink)_40%,transparent)] md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-roast/75">Order summary</p>
          <CartMilestones subtotal={subtotal} milestones={milestones} className="mt-4" />
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between text-roast">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatINR(subtotal)}</dd>
            </div>
            {reward.discount ? (
              <div className="flex justify-between font-semibold text-[#3f5212]">
                <dt>{reward.percent}% cart reward</dt>
                <dd className="tabular-nums">− {formatINR(reward.discount)}</dd>
              </div>
            ) : null}
            <div className="flex items-end justify-between gap-3 border-t border-line/50 pt-3">
              <dt>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-roast/70">Estimated total</span>
                <span className="mt-0.5 block font-display text-2xl font-black leading-none">Due now</span>
              </dt>
              <dd className="font-display text-[1.85rem] font-black tabular-nums leading-none">{formatINR(total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-roast">Taxes included. Shipping and discount codes apply at checkout.</p>
          <Link
            href="/checkout"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-center font-semibold text-paper transition-colors hover:bg-roast"
          >
            <Lock className="size-4 opacity-80" aria-hidden />
            Checkout · {formatINR(total)}
          </Link>
          <Link href="/collections/dry-fruits" className="mt-4 block text-center text-sm font-semibold text-roast underline-offset-2 hover:text-ink hover:underline">
            Continue shopping
          </Link>
        </div>
      </aside>

      <div className="lg:col-span-2">
        <PairsWell products={products} lines={lines} title="Complete your snack box" layout="grid" />
      </div>
    </div>
  );
}
