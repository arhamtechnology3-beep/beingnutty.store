import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const storeField =
  "w-full rounded-2xl border-2 border-line bg-paper px-4 py-3 text-base transition-colors placeholder:text-roast/50 focus:border-ink focus:outline-none";

export const storeButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-paper transition-colors hover:bg-roast disabled:opacity-60";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-roast">{hint}</span> : null}
    </label>
  );
}

/** Shared page shell for simple storefront pages. */
export function StorePage({ title, intro, children, width = "max-w-3xl" }: { title: string; intro?: string; children: ReactNode; width?: string }) {
  return (
    <div className={cn("mx-auto px-5 pb-28 pt-32 md:pt-40", width)}>
      <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">{title}</h1>
      {intro ? <p className="mt-4 text-lg text-roast">{intro}</p> : null}
      <div className="mt-10">{children}</div>
    </div>
  );
}
