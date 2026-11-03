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
      <p className="text-sm font-medium" aria-live="polite">
        {next ? (
          <>
            You&apos;re <strong className="tabular-nums">{formatINR(next.at - subtotal)}</strong> away from{" "}
            <strong className="text-[#3f5212]">{next.label}</strong>
          </>
        ) : (
          <strong className="text-[#3f5212]">You&apos;ve unlocked every reward — enjoy!</strong>
        )}
      </p>
      <div className="relative mx-3 mb-12 mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-pista transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
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
                  done ? "border-pista bg-pista text-ink" : "border-line bg-paper text-roast",
                )}
              >
                <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              <span
                className={cn(
                  "absolute top-full mt-1.5 whitespace-nowrap text-center text-[11px] leading-tight",
                  pos > 85 ? "right-0" : "left-1/2 -translate-x-1/2",
                  done ? "font-semibold text-ink" : "text-roast",
                )}
              >
                {m.short}
                <span className="block tabular-nums opacity-75">{formatINR(m.at)}</span>
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
