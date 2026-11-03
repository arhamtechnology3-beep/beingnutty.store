"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function setInventory(variantId: string, formData: FormData) {
  await requireAdmin();
  const qty = Number(formData.get("qty"));
  if (!Number.isInteger(qty) || qty < 0 || qty > 1_000_000) return;
  await db.productVariant.update({ where: { id: variantId }, data: { inventoryQty: qty } });
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}
