import { Check, Percent, Truck } from "lucide-react";
import type { Milestone } from "@/lib/rewards";
import { cn, formatINR } from "@/lib/utils";

/** Tiered progress bar: free delivery, then % off rewards. */
export function CartMilestones({ subtotal, milestones, className }: { subtotal: number; milestones: Milestone[]; className?: string }) {
  if (!milestones.length) return null;
  const max = milestones.at(-1)!.at;
  const next = milestones.find((m) => subtotal < m.at);
  const progress = Math.min(100, (subtotal / max) * 100);

  return (
    <div className={className}>
      <p className="text-sm leading-snug" aria-live="polite">
        {next ? (
          <>
            <span className="text-roast">You&apos;re </span>
            <strong className="font-display text-base font-bold tabular-nums">{formatINR(next.at - subtotal)}</strong>
            <span className="text-roast"> from </span>
            <strong className="text-[#3f5212]">{next.label}</strong>
          </>
        ) : (
          <strong className="font-display text-base font-bold text-[#3f5212]">Every reward unlocked — enjoy.</strong>
        )}
      </p>
      <div className="relative mx-2 mb-11 mt-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-line/80" aria-hidden>
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--pista),color-mix(in_oklab,var(--caramel)_55%,var(--pista)))] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {milestones.map((m) => {
          const done = subtotal >= m.at;
          const pos = (m.at / max) * 100;
          const Icon = done ? Check : m.kind === "shipping" ? Truck : Percent;
          return (
            <div key={m.at} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border-2 transition-colors duration-500",
                  done
                    ? "border-pista bg-pista text-ink shadow-[0_0_0_3px_color-mix(in_oklab,var(--pista)_28%,transparent)]"
                    : "border-line bg-paper text-roast",
                )}
              >
                <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              <span
                className={cn(
                  "absolute top-full mt-1.5 whitespace-nowrap text-center text-[10px] font-medium uppercase leading-tight tracking-[0.08em]",
                  pos > 85 ? "right-0" : "left-1/2 -translate-x-1/2",
                  done ? "text-ink" : "text-roast/80",
                )}
              >
                {m.short}
                <span className="mt-0.5 block font-sans normal-case tracking-normal tabular-nums opacity-75">{formatINR(m.at)}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="sr-only">
        Rewards: {milestones.map((m) => `${m.label} on orders above ${formatINR(m.at)}`).join("; ")}.
      </p>
    </div>
  );
}
