"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/action-form";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/form";
import { hashPassword, verifyPassword } from "@/lib/passwords";

const rupees = z.coerce.number().min(0).max(100_000).transform((v) => Math.round(v * 100));

export async function saveShipping(formData: FormData): Promise<FormState> {
  await requireOwner();
  const parsed = z
    .object({ flatRate: rupees, freeAbove: rupees })
    .safeParse({ flatRate: formData.get("flatRate"), freeAbove: formData.get("freeAbove") });
  if (!parsed.success) return { error: "Enter valid amounts in rupees." };
  const tier = z.object({ at: rupees, percent: z.coerce.number().int().min(0).max(50) });
  const rewards = [];
  for (const i of [1, 2, 3]) {
    const t = tier.safeParse({ at: formData.get(`rewardAt${i}`) || 0, percent: formData.get(`rewardPercent${i}`) || 0 });
    if (!t.success) return { error: `Cart reward ${i}: enter a rupee amount and a 0–50% discount.` };
    if (t.data.at > 0 && t.data.percent > 0) rewards.push(t.data);
  }
  const value = { ...parsed.data, codEnabled: formData.get("codEnabled") === "on", rewards };
  await db.setting.upsert({ where: { key: "shipping" }, update: { value }, create: { key: "shipping", value } });
  revalidatePath("/", "layout");
  return { ok: "Shipping settings saved." };
}

const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(80),
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  password: z.string().min(10, "Use a password of at least 10 characters"),
  role: z.enum(["OWNER", "STAFF"]),
});

export async function addStaff(formData: FormData): Promise<FormState> {
  await requireOwner();
  const parsed = staffSchema.safeParse(Object.fromEntries(["name", "email", "password", "role"].map((k) => [k, String(formData.get(k) ?? "")])));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { password, ...rest } = parsed.data;
  try {
    await db.adminUser.create({ data: { ...rest, passwordHash: await hashPassword(password) } });
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "That email already has admin access." };
    throw e;
  }
  revalidatePath("/admin/settings");
  return { ok: `${rest.name} can now sign in at /admin.` };
}

export async function removeStaff(adminId: string) {
  const me = await requireOwner();
  if (adminId === me.id) return;
  await db.adminUser.delete({ where: { id: adminId } });
  revalidatePath("/admin/settings");
}

export async function changeAdminPassword(formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  const row = await db.adminUser.findUniqueOrThrow({ where: { id: me.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(current, row.passwordHash))) return { error: "Your current password is incorrect." };
  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Password updated." };
}
