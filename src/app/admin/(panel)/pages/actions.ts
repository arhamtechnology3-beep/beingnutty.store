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
  title: z.string().min(2, "Title is required").max(120),
  slug: z.string(),
  body: z.string().min(1, "Content is required"),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
});

export async function savePage(pageId: string | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(formStrings(formData, ["title", "slug", "body", "seoTitle", "seoDescription"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const data = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    body: d.body,
    published: formData.get("published") === "on",
    seoTitle: orNull(d.seoTitle),
    seoDescription: orNull(d.seoDescription),
  };

  let id = pageId;
  try {
    id = (pageId ? await db.page.update({ where: { id: pageId }, data }) : await db.page.create({ data })).id;
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Another page already uses that URL handle." };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${id}?saved=1`);
}

export async function deletePage(pageId: string) {
  await requireAdmin();
  await db.page.delete({ where: { id: pageId } });
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}
