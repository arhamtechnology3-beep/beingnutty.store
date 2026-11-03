"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { addOrderEvent } from "@/lib/order-events";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  courier: z.string().trim().max(80),
  trackingNumber: z.string().trim().max(80),
});

export async function updateOrder(orderId: string, formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));
  const before = await db.order.findUnique({ where: { id: orderId } });
  if (!before) return;

  const courier = data.courier || null;
  const trackingNumber = data.trackingNumber || null;

  await db.order.update({
    where: { id: orderId },
    data: { status: data.status, paymentStatus: data.paymentStatus, courier, trackingNumber },
  });

  if (before.status !== data.status) {
    await addOrderEvent(orderId, "STATUS_CHANGED", `Order status → ${data.status}`, { from: before.status, to: data.status });
  }
  if (before.paymentStatus !== data.paymentStatus) {
    await addOrderEvent(orderId, "PAYMENT_STATUS", `Payment status → ${data.paymentStatus}`, {
      from: before.paymentStatus,
      to: data.paymentStatus,
    });
  }
  if (trackingNumber && trackingNumber !== before.trackingNumber) {
    await addOrderEvent(
      orderId,
      "TRACKING_ADDED",
      courier ? `Tracking added via ${courier}: ${trackingNumber}` : `Tracking added: ${trackingNumber}`,
      { courier, trackingNumber },
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
}
