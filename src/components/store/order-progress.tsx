import { Check } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS_LABEL, ORDER_STEPS, orderStepIndex } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderProgress({
  status,
  courier,
  trackingNumber,
}: {
  status: OrderStatus;
  courier: string | null;
  trackingNumber: string | null;
}) {
  const current = orderStepIndex(status);

  if (current === -1) {
    return (
      <p className="rounded-2xl bg-paper px-5 py-4 font-semibold">
        Status: <span className="text-roast">{ORDER_STATUS_LABEL[status]}</span>
      </p>
    );
  }

  return (
    <div className="rounded-[2rem] bg-paper p-6 md:p-8">
      <ol className="grid grid-cols-4 gap-2">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= current;
          return (
            <li key={step} className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2 text-sm font-bold",
                  done ? "border-ink bg-ink text-paper" : "border-line text-roast",
                )}
                aria-hidden
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("mt-2 text-xs font-semibold sm:text-sm", !done && "text-roast")}>
                {ORDER_STATUS_LABEL[step]}
                <span className="sr-only">{done ? " (done)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {courier || trackingNumber ? (
        <p className="mt-6 border-t border-line pt-4 text-sm">
          {courier ? <>Shipped with <strong>{courier}</strong></> : "Tracking number"}
          {trackingNumber ? (
            <>
              {" · "}
              <span className="font-mono">{trackingNumber}</span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
