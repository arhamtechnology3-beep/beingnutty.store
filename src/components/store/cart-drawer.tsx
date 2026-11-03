"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lock, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cart, cartTotals, useCartLines, useCartOpen } from "@/lib/cart-store";
import type { MiniProduct } from "@/lib/recommend";
import { rewardFor, type Milestone, type RewardTier } from "@/lib/rewards";
import { formatINR } from "@/lib/utils";
import { CartMilestones } from "./cart-milestones";
import { PairsWell, UpgradeOffer } from "./cart-upsells";
import { LineThumb } from "./line-thumb";

export type CartCatalog = { products: MiniProduct[]; milestones: Milestone[]; rewards: RewardTier[]; codEnabled: boolean };

export function CartDrawer({ products, milestones, rewards, codEnabled }: CartCatalog) {
  const open = useCartOpen();
  const lines = useCartLines();
  const { subtotal, count } = cartTotals(lines);
  const reward = rewardFor(subtotal, rewards);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  useEffect(() => {
    cart.fillImages(Object.fromEntries(products.map((p) => [p.slug, p.image])));
  }, [products]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => cart.setOpen(false);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            data-lenis-prevent
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-2xl font-bold">
                Your cart {count ? <span className="text-base font-semibold text-roast">({count})</span> : null}
              </h2>
              <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full border border-line" aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-6 py-10">
                <div className="text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-cream">
                    <ShoppingBag className="size-7 text-roast" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-3xl font-bold">Nothing nutty here yet.</p>
                  <p className="mt-2 text-roast">Start with a bestseller — one tap adds it.</p>
                  <a href="/collections/dry-fruits" onClick={close} className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">
                    Shop all dry fruits
                  </a>
                </div>
                <div className="mt-10">
                  <PairsWell products={products} lines={lines} title="Bestsellers" onNavigate={close} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <CartMilestones subtotal={subtotal} milestones={milestones} className="border-b border-line bg-cream/60 px-6 pt-4" />
                  <ul className="divide-y divide-line px-6">
                    {lines.map((line) => (
                      <li key={line.variantId} className="flex gap-4 py-5">
                        <Link href={`/products/${line.slug}`} onClick={close} tabIndex={-1} aria-hidden>
                          <LineThumb image={line.image} accentColor={line.accentColor} sizes="80px" className="size-20 rounded-xl" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/products/${line.slug}`} onClick={close} className="font-semibold leading-tight hover:underline">
                              {line.title}
                            </Link>
                            <p className="font-semibold tabular-nums">{formatINR(line.price * line.quantity)}</p>
                          </div>
                          <p className="text-sm text-roast">
                            {line.variantTitle} · {formatINR(line.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-line">
                              <button
                                type="button"
                                className="grid size-8 place-items-center"
                                onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
                                aria-label={`Decrease ${line.title} quantity`}
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                              <button
                                type="button"
                                className="grid size-8 place-items-center"
                                onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
                                aria-label={`Increase ${line.title} quantity`}
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <button type="button" className="text-xs text-roast underline" onClick={() => cart.remove(line.variantId)}>
                              Remove
                            </button>
                          </div>
                          <UpgradeOffer line={line} product={bySlug.get(line.slug)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-line px-6 py-6">
                    <PairsWell products={products} lines={lines} onNavigate={close} />
                  </div>
                </div>

                <div className="border-t border-line px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-roast">Subtotal</dt>
                      <dd className="tabular-nums">{formatINR(subtotal)}</dd>
                    </div>
                    {reward.discount ? (
                      <div className="flex justify-between font-semibold text-[#3f5212]">
                        <dt>{reward.percent}% cart reward</dt>
                        <dd className="tabular-nums">− {formatINR(reward.discount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-1 text-lg font-bold">
                      <dt>Estimated total</dt>
                      <dd className="tabular-nums">{formatINR(subtotal - reward.discount)}</dd>
                    </div>
                  </dl>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-center font-semibold text-paper transition-colors hover:bg-roast"
                  >
                    <Lock className="size-4" aria-hidden />
                    Checkout · {formatINR(subtotal - reward.discount)}
                  </Link>
                  <p className="mt-2 text-center text-xs text-roast">
                    Secure checkout · UPI, cards{codEnabled ? " & cash on delivery" : ""} ·{" "}
                    <Link href="/cart" onClick={close} className="font-semibold text-ink underline underline-offset-2">
                      View cart
                    </Link>
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
