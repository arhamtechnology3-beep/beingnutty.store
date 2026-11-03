"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type DiscountFormState = { error?: string; ok?: boolean } | null;

const schema = z.object({
  code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0),
  minSubtotal: z.coerce.number().min(0),
  usageLimit: z.union([z.literal(""), z.coerce.number().int().min(1)]),
  endsAt: z.string(),
});

export async function createDiscount(_prev: DiscountFormState, formData: FormData): Promise<DiscountFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  if (d.type === "PERCENTAGE" && (d.value <= 0 || d.value > 100)) return { error: "Percentage must be between 1 and 100." };

  try {
    await db.discount.create({
      data: {
        code: d.code.toUpperCase(),
        type: d.type,
        value: d.type === "PERCENTAGE" ? Math.round(d.value) : Math.round(d.value * 100),
        minSubtotal: Math.round(d.minSubtotal * 100),
        usageLimit: d.usageLimit === "" ? null : d.usageLimit,
        endsAt: d.endsAt ? new Date(`${d.endsAt}T23:59:59+05:30`) : null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "That code already exists." };
    throw e;
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await db.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}

export async function toggleDiscount(id: string) {
  await requireAdmin();
  const d = await db.discount.findUniqueOrThrow({ where: { id } });
  await db.discount.update({ where: { id }, data: { active: !d.active } });
  revalidatePath("/admin/discounts");
}
