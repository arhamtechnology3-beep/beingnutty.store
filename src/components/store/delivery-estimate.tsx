"use client";

import { useSyncExternalStore } from "react";
import { Truck } from "lucide-react";
import { site } from "@/lib/site";

const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** Adds working days (Mon–Sat; couriers don't move on Sunday). */
function addWorkingDays(from: Date, days: number) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d;
}

function estimate() {
  const now = new Date();
  const earliest = addWorkingDays(now, site.dispatchDays[0] + site.transitDays[0]);
  const latest = addWorkingDays(now, site.dispatchDays[1] + site.transitDays[1]);
  return `${fmt.format(earliest)} – ${fmt.format(latest)}`;
}

const noop = () => () => {};

export function DeliveryEstimate({ freeAbove }: { freeAbove: string }) {
  const range = useSyncExternalStore(noop, estimate, () => null);
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3.5">
      <Truck className="mt-0.5 size-5 shrink-0 text-roast" aria-hidden />
      <p className="text-sm leading-relaxed">
        {range ? (
          <>
            Order today, get it by <strong>{range}</strong>.
          </>
        ) : (
          <>Ships in {site.dispatchDays.join("–")} working days, delivered across India.</>
        )}{" "}
        <span className="text-roast">Free delivery above {freeAbove}.</span>
      </p>
    </div>
  );
}
