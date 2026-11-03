"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  courier: z.string().trim().max(80),
  trackingNumber: z.string().trim().max(80),
});

export async function updateOrder(orderId: string, formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));
  await db.order.update({
    where: { id: orderId },
    data: { ...data, courier: data.courier || null, trackingNumber: data.trackingNumber || null },
  });
  revalidatePath(`/admin/orders/${orderId}`);
}
