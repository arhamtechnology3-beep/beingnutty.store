"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/action-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function updateCustomer(customerId: string, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
  await db.customer.update({
    where: { id: customerId },
    data: { note: note || null, tags, acceptsMarketing: formData.get("acceptsMarketing") === "on" },
  });
  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/customers");
  return { ok: "Customer saved." };
}
