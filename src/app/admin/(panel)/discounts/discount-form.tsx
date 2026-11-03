"use client";

import { useActionState } from "react";
import { buttonClass, inputClass } from "@/components/admin/ui";
import { createDiscount, type DiscountFormState } from "./actions";

export function DiscountForm() {
  const [state, action, pending] = useActionState<DiscountFormState, FormData>(createDiscount, null);

  return (
    <form action={action} className="mt-4 space-y-4 text-sm">
      <label className="block">
        <span className="mb-1.5 block font-medium">Code</span>
        <input name="code" required placeholder="NUTTY10" className={`${inputClass} uppercase`} />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">Type</span>
        <select name="type" className={inputClass}>
          <option value="PERCENTAGE">Percentage off</option>
          <option value="FIXED">Fixed amount off (₹)</option>
          <option value="FREE_SHIPPING">Free shipping</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">Value</span>
        <input name="value" type="number" min="0" step="1" defaultValue="10" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">Minimum order (₹)</span>
        <input name="minSubtotal" type="number" min="0" defaultValue="0" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">Usage limit (optional)</span>
        <input name="usageLimit" type="number" min="1" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">Ends on (optional)</span>
        <input name="endsAt" type="date" className={inputClass} />
      </label>
      {state?.error ? <p className="font-medium text-red-700">{state.error}</p> : null}
      {state?.ok ? <p className="font-medium text-emerald-700">Discount created.</p> : null}
      <button type="submit" disabled={pending} className={`${buttonClass()} w-full`}>
        {pending ? "Creating…" : "Create discount"}
      </button>
    </form>
  );
}
