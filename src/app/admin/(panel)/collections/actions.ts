"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/components/action-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formStrings, isUniqueViolation, orNull } from "@/lib/form";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2, "Title is required").max(80),
  slug: z.string(),
  description: z.string().max(600),
  image: z.union([z.literal(""), z.url("Image must be a full URL (https://…)")]),
  position: z.coerce.number().int().min(0).max(999),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
});

export async function saveCollection(collectionId: string | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(formStrings(formData, ["title", "slug", "description", "image", "position", "seoTitle", "seoDescription"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const productIds = formData.getAll("productIds").map(String);
  const data = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    description: orNull(d.description),
    image: orNull(d.image),
    position: d.position,
    published: formData.get("published") === "on",
    seoTitle: orNull(d.seoTitle),
    seoDescription: orNull(d.seoDescription),
  };

  let id = collectionId;
  try {
    id = await db.$transaction(async (tx) => {
      const c = collectionId ? await tx.collection.update({ where: { id: collectionId }, data }) : await tx.collection.create({ data });
      await tx.productCollection.deleteMany({ where: { collectionId: c.id } });
      if (productIds.length) {
        await tx.productCollection.createMany({ data: productIds.map((productId, position) => ({ productId, collectionId: c.id, position })) });
      }
      return c.id;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Another collection already uses that URL handle." };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/collections/${id}?saved=1`);
}

export async function deleteCollection(collectionId: string) {
  await requireAdmin();
  await db.collection.delete({ where: { id: collectionId } });
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}
