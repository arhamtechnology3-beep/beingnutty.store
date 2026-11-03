import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LineThumb } from "@/components/store/line-thumb";
import { OrderProgress } from "@/components/store/order-progress";
import { db } from "@/lib/db";
import { visualsForOrderItems } from "@/lib/order-images";
import { formatINR } from "@/lib/utils";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

type Address = { name: string; line1: string; line2?: string; city: string; state: string; pincode: string; phone: string };

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { placed } = await searchParams;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const address = order.shippingAddress as Address;
  const awaitingPayment = order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID";
  const visuals = await visualsForOrderItems(order.items);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
      {placed && !awaitingPayment ? <ClearCart /> : null}
      <CheckCircle2 className="size-14 text-pista" aria-hidden />
      <h1 className="mt-6 font-display text-5xl font-black tracking-tight md:text-6xl">
        {awaitingPayment ? "Awaiting payment" : placed ? "Thank you!" : `Order #${order.number}`}
      </h1>
      <p className="mt-4 text-xl text-roast">
        {placed || awaitingPayment ? (
          <>
            Order <strong className="text-ink">#{order.number}</strong>{" "}
            {awaitingPayment ? "is waiting for payment confirmation." : `is confirmed. We'll send updates to ${order.email}.`}
          </>
        ) : (
          `Placed on ${order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })}`
        )}
      </p>

      {!awaitingPayment ? (
        <div className="mt-10">
          <OrderProgress status={order.status} courier={order.courier} trackingNumber={order.trackingNumber} />
        </div>
      ) : null}

      <div className="mt-6 rounded-[2rem] bg-paper p-6 md:p-8">
        <ul className="divide-y divide-line">
          {order.items.map((item) => {
            const visual = item.variantId ? visuals.get(item.variantId) : undefined;
            return (
              <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <LineThumb
                    image={visual?.image}
                    accentColor={visual?.accentColor ?? "#d08a3c"}
                    className="size-16 md:size-20"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.productTitle}</span>
                    <span className="text-sm text-roast">
                      {item.variantTitle} × {item.quantity}
                    </span>
                  </span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">{formatINR(item.price * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex justify-between">
            <dt className="text-roast">Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          {order.discountTotal ? (
            <div className="flex justify-between">
              <dt className="text-roast">Discount</dt>
              <dd>− {formatINR(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-roast">Shipping</dt>
            <dd>{order.shippingTotal ? formatINR(order.shippingTotal) : "Free"}</dd>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-roast">Delivering to</h2>
          <address className="mt-2 not-italic leading-relaxed">
            {address.name}
            <br />
            {address.line1}
            {address.line2 ? (
              <>
                <br />
                {address.line2}
              </>
            ) : null}
            <br />
            {address.city}, {address.state} {address.pincode}
          </address>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-roast">Payment</h2>
          <p className="mt-2">{order.paymentMethod === "COD" ? "Cash on delivery" : `Online — ${order.paymentStatus.toLowerCase()}`}</p>
        </div>
      </div>

      <Link href="/collections/dry-fruits" className="mt-12 inline-block rounded-full bg-ink px-7 py-4 font-semibold text-paper">
        Continue shopping
      </Link>
    </div>
  );
}
