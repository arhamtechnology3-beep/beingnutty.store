"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/components/action-form";
import { db } from "@/lib/db";

export async function trackOrder(formData: FormData): Promise<FormState> {
  const number = Number(String(formData.get("number") ?? "").replace(/\D/g, ""));
  const contact = String(formData.get("contact") ?? "").trim().toLowerCase();
  if (!number || !contact) return { error: "Enter your order number and the email or mobile number used at checkout." };

  const digits = contact.replace(/\D/g, "").slice(-10);
  const order = await db.order.findFirst({
    where: {
      number,
      OR: [{ email: contact }, ...(digits.length === 10 ? [{ phone: digits }] : [])],
    },
    select: { id: true },
  });
  if (!order) return { error: "We couldn't find an order with those details. Please check and try again." };
  redirect(`/orders/${order.id}`);
}
