"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { storeButton } from "@/components/store/fields";
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

  if (lines.length === 0) {
    return (
      <div className="mt-12 rounded-[2rem] bg-paper p-12 text-center">
        <p className="font-display text-3xl font-bold">Nothing nutty here yet.</p>
        <Link href="/collections/dry-fruits" className={`${storeButton} mt-6`}>
          Shop dry fruits
        </Link>
        <div className="mt-12 text-left">
          <PairsWell products={products} lines={lines} title="Bestsellers" layout="grid" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={line.variantId} className="flex gap-4 py-6 sm:gap-5">
            <Link href={`/products/${line.slug}`} tabIndex={-1} aria-hidden>
              <LineThumb image={line.image} accentColor={line.accentColor} className="size-20 sm:size-24" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <Link href={`/products/${line.slug}`} className="text-lg font-semibold leading-tight hover:underline">
                  {line.title}
                </Link>
                <p className="text-roast">{line.variantTitle}</p>
                <p className="mt-1 text-sm text-roast tabular-nums">{formatINR(line.price)} each</p>
                <UpgradeOffer line={line} product={bySlug.get(line.slug)} />
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center rounded-full border-2 border-line">
                  <button
                    type="button"
                    className="grid size-10 place-items-center"
                    onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
                    aria-label={`Decrease ${line.title} quantity`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    className="grid size-10 place-items-center"
                    onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
                    aria-label={`Increase ${line.title} quantity`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => cart.remove(line.variantId)}
                  className="grid size-10 place-items-center rounded-full text-roast hover:bg-paper"
                  aria-label={`Remove ${line.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
                <p className="ml-auto min-w-16 text-right font-semibold tabular-nums">{formatINR(line.price * line.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2rem] bg-paper p-6 md:p-8">
          <CartMilestones subtotal={subtotal} milestones={milestones} />
          <dl className="mt-2 space-y-1.5">
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
            <div className="flex justify-between pt-1 text-xl font-bold">
              <dt>Estimated total</dt>
              <dd className="tabular-nums">{formatINR(subtotal - reward.discount)}</dd>
            </div>
          </dl>
          <p className="mt-1 text-sm text-roast">Prices include all taxes. Shipping and discount codes are applied at checkout.</p>
          <Link href="/checkout" className={`${storeButton} mt-6 w-full`}>
            Checkout
          </Link>
          <Link href="/collections/dry-fruits" className="mt-4 block text-center text-sm font-semibold underline">
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
