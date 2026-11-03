import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass, Card, inputClass, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { updateOrder } from "../actions";

export const dynamic = "force-dynamic";

type Address = { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, customer: true } });
  if (!order) notFound();
  const address = order.shippingAddress as Address;

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
        <span className="text-sm text-black/50">{order.createdAt.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-3 divide-y divide-black/5">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="block font-medium">{item.productTitle}</span>
                    <span className="text-black/50">
                      {item.variantTitle} · {item.sku}
                    </span>
                  </span>
                  <span className="text-right tabular-nums">
                    {formatINR(item.price)} × {item.quantity}
                    <span className="block font-semibold">{formatINR(item.price * item.quantity)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-black/10 pt-3 text-sm">
              <Line label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discountTotal ? <Line label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`} value={`− ${formatINR(order.discountTotal)}`} /> : null}
              <Line label="Shipping" value={order.shippingTotal ? formatINR(order.shippingTotal) : "Free"} />
              <div className="flex justify-between pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
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
              {order.razorpayOrderId ? <Line label="Razorpay order" value={order.razorpayOrderId} /> : null}
              {order.razorpayPaymentId ? <Line label="Payment ID" value={order.razorpayPaymentId} /> : null}
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
      <dt className="text-black/55">{label}</dt>
      <dd className="break-all text-right">{value}</dd>
    </div>
  );
}
