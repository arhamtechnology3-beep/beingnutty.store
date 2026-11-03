import "server-only";
import { db } from "./db";
import { addOrderEvent } from "./order-events";
import { visualsForOrderItems } from "./order-images";
import { notifyOrderPlaced, sendShippingUpdateEmail, type MailOrder } from "./mail";

async function toMailOrder(order: {
  id: string;
  number: number;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  paymentMethod: string;
  discountCode: string | null;
  sourceChannel: string | null;
  courier: string | null;
  trackingNumber: string | null;
  shippingAddress: unknown;
  items: { variantId: string | null; productTitle: string; variantTitle: string; quantity: number; price: number }[];
}): Promise<MailOrder> {
  const visuals = await visualsForOrderItems(order.items);
  return {
    id: order.id,
    number: order.number,
    email: order.email,
    phone: order.phone,
    total: order.total,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    paymentMethod: order.paymentMethod,
    discountCode: order.discountCode,
    sourceChannel: order.sourceChannel,
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      price: i.price,
      imageUrl: i.variantId ? visuals.get(i.variantId)?.imageAbsolute ?? null : null,
    })),
    shippingAddress: order.shippingAddress as MailOrder["shippingAddress"],
  };
}

/** Fire confirmation + admin emails and record timeline events. */
export async function afterOrderConfirmed(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const payload = await toMailOrder(order);
  const result = await notifyOrderPlaced(payload);

  if (result.customer.ok) {
    await addOrderEvent(orderId, "EMAIL_SENT", `Confirmation email sent to ${order.email}`);
  } else {
    await addOrderEvent(orderId, "EMAIL_SKIPPED", "Customer confirmation email was not sent.", {
      reason: result.customer.reason,
    });
  }

  if (result.admin.ok) {
    const to = "to" in result.admin ? result.admin.to?.join(", ") : "seller";
    await addOrderEvent(orderId, "ADMIN_NOTIFIED", `Seller notified (${to})`);
  } else {
    await addOrderEvent(orderId, "ADMIN_NOTIFY_SKIPPED", "Seller new-order email was not sent.", {
      reason: result.admin.reason,
    });
  }
}

/** Customer “your order shipped” mail when tracking/status is set in admin. */
export async function afterOrderShipped(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;
  const result = await sendShippingUpdateEmail(await toMailOrder(order));
  if (result.ok) {
    await addOrderEvent(orderId, "SHIPPING_EMAIL_SENT", `Shipping update emailed to ${order.email}`);
  } else {
    await addOrderEvent(orderId, "SHIPPING_EMAIL_SKIPPED", "Shipping email was not sent.", {
      reason: result.reason,
    });
  }
}
