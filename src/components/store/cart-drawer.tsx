"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Lock, Minus, Plus, X } from "lucide-react";
import { cart, cartTotals, useCartLines, useCartOpen } from "@/lib/cart-store";
import type { MiniProduct } from "@/lib/recommend";
import { rewardFor, type Milestone, type RewardTier } from "@/lib/rewards";
import { formatINR } from "@/lib/utils";
import { CartMilestones } from "./cart-milestones";
import { PairsWell, UpgradeOffer } from "./cart-upsells";
import { LineThumb } from "./line-thumb";

export type CartCatalog = { products: MiniProduct[]; milestones: Milestone[]; rewards: RewardTier[]; codEnabled: boolean };

const ease = [0.16, 1, 0.3, 1] as const;

export function CartDrawer({ products, milestones, rewards, codEnabled }: CartCatalog) {
  const open = useCartOpen();
  const lines = useCartLines();
  const { subtotal, count } = cartTotals(lines);
  const reward = rewardFor(subtotal, rewards);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const total = subtotal - reward.discount;

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
            className="fixed inset-0 z-[60] bg-[color-mix(in_oklab,var(--ink)_48%,transparent)] backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            data-lenis-prevent
            className="grain fixed inset-y-0 right-0 z-[61] flex w-full max-w-[28rem] flex-col overflow-hidden bg-[linear-gradient(165deg,var(--paper)_0%,var(--cream)_55%,color-mix(in_oklab,var(--caramel)_12%,var(--cream))_100%)] shadow-[-24px_0_60px_-20px_color-mix(in_oklab,var(--ink)_35%,transparent)] md:max-w-[30rem]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 320 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--caramel)_28%,transparent),transparent_65%)]"
            />

            <header className="relative z-10 flex items-start justify-between gap-4 px-6 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-7 md:pt-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-roast/80">Your pantry</p>
                <h2 className="mt-1 font-display text-[2rem] font-black leading-none tracking-tight md:text-[2.35rem]">
                  Cart
                  {count ? (
                    <span className="ml-2 align-middle text-base font-semibold tracking-normal text-caramel">
                      · {count} {count === 1 ? "can" : "cans"}
                    </span>
                  ) : null}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line/80 bg-paper/70 text-ink shadow-sm transition-colors hover:border-ink hover:bg-paper"
                aria-label="Close cart"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-8 md:px-7">
                <div className="mt-6 rounded-[1.75rem] border border-line/60 bg-paper/55 px-6 py-12 text-center shadow-[inset_0_1px_0_color-mix(in_oklab,white_55%,transparent)]">
                  <span
                    aria-hidden
                    className="mx-auto grid size-[4.5rem] place-items-center rounded-[1.35rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--caramel)_35%,var(--cream)),var(--cream))] shadow-inner"
                  >
                    <span className="font-display text-3xl font-black text-roast/40">0</span>
                  </span>
                  <p className="mt-6 font-display text-[1.85rem] font-black leading-tight tracking-tight">Nothing nutty here yet.</p>
                  <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-roast">
                    Start with a bestseller — one can, sealed fresh, ready to snack.
                  </p>
                  <a
                    href="/collections/dry-fruits"
                    onClick={close}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-roast"
                  >
                    Shop the range
                    <ArrowRight className="size-4" aria-hidden />
                  </a>
                </div>
                <div className="mt-10">
                  <PairsWell products={products} lines={lines} title="Bestsellers" onNavigate={close} />
                </div>
              </div>
            ) : (
              <>
                <div className="relative z-10 flex-1 overflow-y-auto">
                  <CartMilestones
                    subtotal={subtotal}
                    milestones={milestones}
                    className="mx-5 rounded-2xl border border-line/50 bg-paper/70 px-4 pb-3 pt-4 shadow-[inset_0_1px_0_color-mix(in_oklab,white_50%,transparent)] md:mx-6"
                  />
                  <ul className="space-y-3 px-5 py-5 md:px-6">
                    {lines.map((line, i) => (
                      <motion.li
                        key={line.variantId}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: Math.min(i, 4) * 0.05, ease }}
                        className="flex gap-4 rounded-[1.35rem] border border-line/50 bg-paper/75 p-3.5 shadow-[0_10px_28px_-22px_color-mix(in_oklab,var(--ink)_55%,transparent)]"
                      >
                        <Link href={`/products/${line.slug}`} onClick={close} tabIndex={-1} aria-hidden className="shrink-0">
                          <LineThumb
                            image={line.image}
                            accentColor={line.accentColor}
                            sizes="112px"
                            className="size-[5.5rem] rounded-[1.1rem] ring-1 ring-ink/5"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/products/${line.slug}`}
                                onClick={close}
                                className="block font-display text-lg font-bold leading-[1.15] tracking-tight hover:text-roast"
                              >
                                {line.title}
                              </Link>
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-roast/75">
                                {line.variantTitle}
                              </p>
                            </div>
                            <p className="shrink-0 font-display text-lg font-bold tabular-nums leading-none">
                              {formatINR(line.price * line.quantity)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-roast tabular-nums">{formatINR(line.price)} each</p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-full border border-line bg-cream/80 p-0.5">
                              <button
                                type="button"
                                className="grid size-8 place-items-center rounded-full transition-colors hover:bg-paper"
                                onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
                                aria-label={`Decrease ${line.title} quantity`}
                              >
                                <Minus className="size-3.5" strokeWidth={2.25} />
                              </button>
                              <span className="w-7 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                              <button
                                type="button"
                                className="grid size-8 place-items-center rounded-full transition-colors hover:bg-paper"
                                onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
                                aria-label={`Increase ${line.title} quantity`}
                              >
                                <Plus className="size-3.5" strokeWidth={2.25} />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="text-xs font-medium text-roast/80 underline-offset-2 transition-colors hover:text-ink hover:underline"
                              onClick={() => cart.remove(line.variantId)}
                            >
                              Remove
                            </button>
                          </div>
                          <UpgradeOffer line={line} product={bySlug.get(line.slug)} />
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="border-t border-line/60 px-5 py-6 md:px-6">
                    <PairsWell products={products} lines={lines} onNavigate={close} />
                  </div>
                </div>

                <div className="relative z-10 border-t border-line/70 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 backdrop-blur-md md:px-6">
                  <dl className="space-y-1.5 text-sm">
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
                        <span className="mt-0.5 block font-display text-2xl font-black leading-none tracking-tight">Due now</span>
                      </dt>
                      <dd className="font-display text-[1.85rem] font-black tabular-nums leading-none tracking-tight">
                        {formatINR(total)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="group mt-4 flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-ink py-4 text-center text-[15px] font-semibold text-paper shadow-[0_14px_32px_-16px_color-mix(in_oklab,var(--ink)_70%,transparent)] transition-[background-color,transform] hover:bg-roast active:scale-[0.985]"
                  >
                    <Lock className="size-4 opacity-80" aria-hidden />
                    Checkout
                    <span className="tabular-nums opacity-80">· {formatINR(total)}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-roast">
                    Secure checkout · UPI, cards{codEnabled ? " & cash on delivery" : ""}
                    <span className="mx-1.5 text-line">·</span>
                    <Link href="/cart" onClick={close} className="font-semibold text-ink underline-offset-2 hover:underline">
                      Full cart
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
