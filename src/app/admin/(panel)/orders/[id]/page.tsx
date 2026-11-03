import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass, Card, inputClass, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { visualsForOrderItems } from "@/lib/order-images";
import { formatINR } from "@/lib/utils";
import { updateOrder } from "../actions";

export const dynamic = "force-dynamic";

type Address = { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
type JourneyEvent = {
  at: string;
  type: string;
  path?: string;
  productSlug?: string;
  productTitle?: string;
  variantTitle?: string;
};

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

function when(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function journeyLabel(e: JourneyEvent) {
  if (e.type === "product") return `Viewed product ${e.productSlug ? `/products/${e.productSlug}` : e.path ?? ""}`;
  if (e.type === "add_to_cart") {
    return `Added to cart — ${e.productTitle ?? e.productSlug ?? "item"}${e.variantTitle ? ` (${e.variantTitle})` : ""}`;
  }
  if (e.type === "checkout") return "Opened checkout";
  return `Visited ${e.path ?? "a page"}`;
}

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();
  const address = order.shippingAddress as Address;
  const journey = (Array.isArray(order.journey) ? order.journey : []) as JourneyEvent[];
  const visuals = await visualsForOrderItems(order.items);
  const priorOrders = order.customerId
    ? await db.order.count({ where: { customerId: order.customerId, id: { not: order.id } } })
    : await db.order.count({ where: { email: order.email, id: { not: order.id } } });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-black/50 hover:underline">
          Orders
        </Link>
        <span className="text-black/30">/</span>
        <h1 className="text-2xl font-semibold">Order #{order.number}</h1>
        <StatusBadge status={order.paymentStatus} />
        <StatusBadge status={order.status} />
        {order.sourceChannel ? (
          <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">{order.sourceChannel}</span>
        ) : null}
        <span className="text-sm text-black/50">{when(order.createdAt)}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-3 divide-y divide-black/5">
              {order.items.map((item) => {
                const visual = item.variantId ? visuals.get(item.variantId) : undefined;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="relative size-14 shrink-0 overflow-hidden rounded-xl"
                        style={{ background: `color-mix(in oklab, ${visual?.accentColor ?? "#d08a3c"} 40%, white)` }}
                      >
                        {visual?.image ? (
                          <Image src={visual.image} alt="" fill sizes="56px" className="object-cover" />
                        ) : null}
                      </div>
                      <span className="min-w-0">
                        <span className="block font-medium">{item.productTitle}</span>
                        <span className="text-black/50">
                          {item.variantTitle} · {item.sku}
                        </span>
                      </span>
                    </div>
                    <span className="shrink-0 text-right tabular-nums">
                      {formatINR(item.price)} × {item.quantity}
                      <span className="block font-semibold">{formatINR(item.price * item.quantity)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-black/10 pt-3 text-sm">
              <Line label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discountTotal ? (
                <Line label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`} value={`− ${formatINR(order.discountTotal)}`} />
              ) : null}
              <Line label="Shipping" value={order.shippingTotal ? formatINR(order.shippingTotal) : "Free"} />
              <div className="flex justify-between pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold">Customer journey</h2>
            <p className="mt-1 text-sm text-black/50">Pages and products this shopper touched before placing the order.</p>
            {journey.length ? (
              <ol className="mt-4 space-y-3 border-l-2 border-black/10 pl-4">
                {journey.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-black/35" />
                    <p className="font-medium">{journeyLabel(e)}</p>
                    <p className="text-xs text-black/45">{when(e.at)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-black/55">No browse timeline was captured for this order (older orders, or ad blockers).</p>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold">Order timeline</h2>
            {order.events.length ? (
              <ol className="mt-4 space-y-3 border-l-2 border-black/10 pl-4">
                {order.events.map((e) => (
                  <li key={e.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-[#2a1a10]" />
                    <p className="font-medium">{e.message}</p>
                    <p className="text-xs text-black/45">
                      {e.type} · {when(e.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-black/55">No events recorded yet.</p>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold">Fulfilment</h2>
            <form action={updateOrder.bind(null, order.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Order status</span>
                <select name="status" defaultValue={order.status} className={inputClass}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Payment status</span>
                <select name="paymentStatus" defaultValue={order.paymentStatus} className={inputClass}>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Courier</span>
                <input name="courier" defaultValue={order.courier ?? ""} placeholder="Delhivery, Blue Dart…" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Tracking number</span>
                <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className={inputClass} />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className={buttonClass()}>
                  Update order
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Customer</h2>
            {order.customer ? (
              <Link href={`/admin/customers/${order.customer.id}`} className="mt-3 block text-sm font-medium hover:underline">
                {`${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim() || order.email}
              </Link>
            ) : (
              <p className="mt-3 text-sm">{order.email}</p>
            )}
            <p className="text-sm text-black/60">{order.email}</p>
            <p className="text-sm text-black/60">{order.phone}</p>
            <p className="mt-2 text-xs text-black/45">
              {priorOrders === 0 ? "First order from this customer" : `${priorOrders} earlier order${priorOrders === 1 ? "" : "s"}`}
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold">Shipping address</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed">
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
              <br />
              {address.phone}
            </address>
          </Card>
          <Card>
            <h2 className="font-semibold">Payment</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Line label="Method" value={order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay"} />
              <Line label="Payment status" value={order.paymentStatus} />
              {order.razorpayOrderId ? <Line label="Razorpay order" value={order.razorpayOrderId} /> : null}
              {order.razorpayPaymentId ? <Line label="Payment ID" value={order.razorpayPaymentId} /> : null}
            </dl>
          </Card>
          <Card>
            <h2 className="font-semibold">Traffic source</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Line label="Channel" value={order.sourceChannel ?? "Direct / Website"} />
              {order.utmSource ? <Line label="utm_source" value={order.utmSource} /> : null}
              {order.utmMedium ? <Line label="utm_medium" value={order.utmMedium} /> : null}
              {order.utmCampaign ? <Line label="utm_campaign" value={order.utmCampaign} /> : null}
              {order.utmContent ? <Line label="utm_content" value={order.utmContent} /> : null}
              {order.utmTerm ? <Line label="utm_term" value={order.utmTerm} /> : null}
              {order.landingPage ? <Line label="Landing page" value={order.landingPage} /> : null}
              {order.referrer ? <Line label="Referrer" value={order.referrer} /> : null}
              {!order.utmSource && !order.referrer && !order.landingPage ? (
                <p className="text-black/55">No campaign tags on this order. Use UTM links on Meta ads, e.g. <code className="text-xs">?utm_source=instagram&amp;utm_medium=paid&amp;utm_campaign=launch</code>.</p>
              ) : null}
            </dl>
          </Card>
          {order.note ? (
            <Card>
              <h2 className="font-semibold">Customer note</h2>
              <p className="mt-2 text-sm">{order.note}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-black/55">{label}</dt>
      <dd className="break-all text-right">{value}</dd>
    </div>
  );
}
