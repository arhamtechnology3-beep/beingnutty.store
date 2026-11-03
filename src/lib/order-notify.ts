import "server-only";
import { db } from "./db";
import { addOrderEvent } from "./order-events";
import { notifyOrderPlaced } from "./mail";

/** Fire confirmation + admin emails and record timeline events (safe to call once per confirmation). */
export async function afterOrderConfirmed(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const address = order.shippingAddress as {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  const payload = {
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
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      price: i.price,
    })),
    shippingAddress: address,
  };

  const result = await notifyOrderPlaced(payload);
  if (result.customer.ok) {
    await addOrderEvent(orderId, "EMAIL_SENT", `Confirmation email sent to ${order.email}`);
  } else {
    await addOrderEvent(orderId, "EMAIL_SKIPPED", "Customer confirmation email was not sent (email not configured or failed).", {
      reason: result.customer.reason,
    });
  }
  if (result.admin.ok) {
    await addOrderEvent(orderId, "ADMIN_NOTIFIED", "Store owner notified of new order");
  }
}
