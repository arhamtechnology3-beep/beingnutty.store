"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { checkoutAttributionPayload, trackJourney } from "@/lib/attribution";
import { cartTotals, useCartLines } from "@/lib/cart-store";
import { INDIAN_STATES } from "@/lib/india";
import type { Quote } from "@/lib/orders";
import { cn, formatINR } from "@/lib/utils";
import { LineThumb } from "@/components/store/line-thumb";
import { confirmPayment, getQuote, placeOrder, type CheckoutInput } from "./actions";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: () => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const field =
  "w-full rounded-2xl border-2 border-line bg-paper px-4 py-3 text-base transition-colors placeholder:text-roast/50 focus:border-ink focus:outline-none";

export type CheckoutDefaults = {
  email: string;
  phone: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export function CheckoutForm({
  onlinePayments,
  codEnabled,
  defaults,
}: {
  onlinePayments: boolean;
  codEnabled: boolean;
  defaults?: CheckoutDefaults;
}) {
  const router = useRouter();
  const lines = useCartLines();
  const { subtotal: clientSubtotal } = cartTotals(lines);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(onlinePayments ? "RAZORPAY" : "COD");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const [pinInfo, setPinInfo] = useState<{ status: "ok" | "unknown"; text: string } | null>(null);

  const lookupPincode = async (pin: string) => {
    setPinInfo(null);
    if (!/^\d{6}$/.test(pin)) return;
    try {
      const res = await fetch(`/api/pincode/${pin}`);
      const data = (await res.json()) as { ok: boolean; city?: string; state?: string; area?: string };
      if (!data.ok || !data.city || !data.state) {
        setPinInfo(res.status === 404 ? { status: "unknown", text: "We couldn't find this pincode — please double-check it." } : null);
        return;
      }
      const state = INDIAN_STATES.find((s) => s.toLowerCase() === data.state!.toLowerCase());
      if (cityRef.current && !cityRef.current.value) cityRef.current.value = data.city;
      if (stateRef.current && state) stateRef.current.value = state;
      setPinInfo({ status: "ok", text: `Delivering to ${data.area}, ${data.city}` });
    } catch {}
  };

  const linesKey = lines.map((l) => `${l.variantId}:${l.quantity}`).join(",");

  useEffect(() => {
    if (!linesKey) return;
    let cancelled = false;
    const input = linesKey.split(",").map((s) => {
      const [variantId, quantity] = s.split(":");
      return { variantId, quantity: Number(quantity) };
    });
    getQuote(input, appliedCode).then((q) => {
      if (!cancelled && "items" in q) setQuote(q);
    });
    return () => {
      cancelled = true;
    };
  }, [linesKey, appliedCode]);

  if (lines.length === 0) {
    return (
      <div className="mt-12 rounded-[2rem] bg-paper p-10 text-center">
        <p className="font-display text-3xl font-bold">Your cart is empty.</p>
        <Link href="/collections/dry-fruits" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-paper">
          Shop dry fruits
        </Link>
      </div>
    );
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    trackJourney({ type: "checkout", path: "/checkout" });
    const { attribution, journey } = checkoutAttributionPayload();
    const input: CheckoutInput = {
      lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      discountCode: appliedCode || undefined,
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "").replace(/\D/g, "").slice(-10),
      name: String(formData.get("name") ?? ""),
      line1: String(formData.get("line1") ?? ""),
      line2: String(formData.get("line2") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      pincode: String(formData.get("pincode") ?? ""),
      paymentMethod,
      note: String(formData.get("note") ?? "") || undefined,
      attribution: attribution ?? undefined,
      journey,
    };

    startTransition(async () => {
      const result = await placeOrder(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.kind === "cod") {
        router.push(`/orders/${result.orderId}?placed=1`);
        return;
      }
      if (!window.Razorpay) {
        setError("Payment window failed to load. Please check your connection and try again.");
        return;
      }
      const rzp = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: "INR",
        name: "Being Nutty",
        description: "Dry fruits order",
        order_id: result.razorpayOrderId,
        prefill: result.prefill,
        theme: { color: "#2a1a10" },
        handler: async (response: RazorpayResponse) => {
          const confirmed = await confirmPayment(response);
          if (confirmed.ok) router.push(`/orders/${result.orderId}?placed=1`);
          else setError("We couldn't verify your payment. If money was deducted, contact us with your order details.");
        },
      });
      rzp.on("payment.failed", () => setError("Payment failed. Please try again or choose another method."));
      rzp.open();
    });
  };

  return (
    <>
      {onlinePayments ? <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> : null}
      <form onSubmit={onSubmit} className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="font-display text-2xl font-bold">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input name="email" type="email" required autoComplete="email" defaultValue={defaults?.email} className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Mobile number</span>
                <input name="phone" type="tel" required autoComplete="tel-national" inputMode="numeric" placeholder="10-digit mobile" defaultValue={defaults?.phone} className={field} />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-display text-2xl font-bold">Delivery address</legend>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Full name</span>
              <input name="name" required autoComplete="name" defaultValue={defaults?.name} className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">House / flat, street</span>
              <input name="line1" required autoComplete="address-line1" defaultValue={defaults?.line1} className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Area, landmark or Google Maps link (optional)</span>
              <input name="line2" autoComplete="address-line2" maxLength={500} defaultValue={defaults?.line2} className={field} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Pincode</span>
                <input
                  name="pincode"
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  defaultValue={defaults?.pincode}
                  onChange={(e) => lookupPincode(e.target.value)}
                  aria-describedby="pincode-info"
                  className={field}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">City</span>
                <input ref={cityRef} name="city" required autoComplete="address-level2" defaultValue={defaults?.city} className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">State</span>
                <select ref={stateRef} name="state" required autoComplete="address-level1" defaultValue={defaults?.state ?? ""} className={field}>
                  <option value="" disabled>
                    Select
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <p id="pincode-info" aria-live="polite" className={cn("-mt-1 text-sm", pinInfo?.status === "unknown" ? "text-[#b42318]" : "text-roast")}>
              {pinInfo?.text}
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Order note (optional)</span>
              <textarea name="note" rows={2} className={field} />
            </label>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl font-bold">Payment</legend>
            <div className="mt-4 space-y-3">
              {[
                { value: "RAZORPAY" as const, label: "Pay online", hint: "UPI, cards, net banking, wallets — via Razorpay", disabled: !onlinePayments },
                { value: "COD" as const, label: "Cash on delivery", hint: "Pay when your order arrives", disabled: !codEnabled },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-colors",
                    paymentMethod === opt.value ? "border-ink bg-paper" : "border-line",
                    opt.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    disabled={opt.disabled}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="mt-1 accent-[var(--ink)]"
                  />
                  <span>
                    <span className="block font-semibold">{opt.label}</span>
                    <span className="block text-sm text-roast">{opt.disabled ? "Not available right now" : opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] bg-paper p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold">Order summary</h2>
            <ul className="mt-6 space-y-4">
              {lines.map((l) => (
                <li key={l.variantId} className="flex items-center gap-4">
                  <span className="relative shrink-0">
                    <LineThumb image={l.image} accentColor={l.accentColor} sizes="56px" className="size-14 rounded-xl" />
                    <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-paper">
                      {l.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">{l.title}</span>
                    <span className="block text-sm text-roast">{l.variantTitle}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatINR(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2">
              <label htmlFor="discount" className="sr-only">
                Discount code
              </label>
              <input
                id="discount"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                className={cn(field, "py-2.5")}
              />
              <button type="button" onClick={() => setAppliedCode(code.trim())} className="rounded-2xl border-2 border-ink px-4 font-semibold">
                Apply
              </button>
            </div>

            <dl className="mt-6 space-y-2 border-t border-line pt-6">
              <Row label="Subtotal" value={formatINR(quote?.subtotal ?? clientSubtotal)} />
              {quote?.discountTotal ? <Row label={quote.discountLabel ?? "Discount"} value={`− ${formatINR(quote.discountTotal)}`} /> : null}
              <Row label="Shipping" value={quote ? (quote.shippingTotal ? formatINR(quote.shippingTotal) : "Free") : "—"} />
              <div className="flex justify-between border-t border-line pt-4 text-xl font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(quote?.total ?? clientSubtotal)}</dd>
              </div>
            </dl>
            {quote && quote.shippingTotal > 0 ? (
              <p className="mt-3 text-sm text-roast">Free shipping on orders above {formatINR(quote.freeShippingAbove)}.</p>
            ) : null}
            {quote?.notes.map((n) => (
              <p key={n} className="mt-3 text-sm font-medium text-[#3f5212]">
                {n}
              </p>
            ))}
            {quote?.errors.map((e) => (
              <p key={e} className="mt-3 text-sm font-medium text-red-700">
                {e}
              </p>
            ))}
            {error ? (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            {!onlinePayments && !codEnabled ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
                We&apos;re not taking orders at the moment. Please check back soon.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending || (!onlinePayments && !codEnabled)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-paper transition-colors hover:bg-roast disabled:opacity-60"
            >
              <Lock className="size-4" />
              {pending ? "Placing order…" : paymentMethod === "COD" ? "Place order" : `Pay ${formatINR(quote?.total ?? clientSubtotal)}`}
            </button>
            <p className="mt-3 text-center text-xs text-roast">Prices include all taxes.</p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-roast">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
