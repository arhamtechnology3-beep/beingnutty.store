"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function setMessageRead(id: string, read: boolean) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await db.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
