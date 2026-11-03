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
  title: z.string().min(2, "Title is required").max(140),
  slug: z.string(),
  excerpt: z.string().max(300, "Keep the excerpt under 300 characters"),
  body: z.string().min(1, "Write the article first"),
  coverImage: z.union([z.literal(""), z.url("Cover image must be a full URL (https://…)")]),
  author: z.string().max(80),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
});

export async function savePost(postId: string | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(
    formStrings(formData, ["title", "slug", "excerpt", "body", "coverImage", "author", "seoTitle", "seoDescription"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const publish = formData.get("published") === "on";
  const existing = postId ? await db.blogPost.findUnique({ where: { id: postId }, select: { publishedAt: true } }) : null;

  const data = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    excerpt: orNull(d.excerpt),
    body: d.body,
    coverImage: orNull(d.coverImage),
    author: d.author || "Being Nutty",
    publishedAt: publish ? (existing?.publishedAt ?? new Date()) : null,
    seoTitle: orNull(d.seoTitle),
    seoDescription: orNull(d.seoDescription),
  };

  let id = postId;
  try {
    id = (postId ? await db.blogPost.update({ where: { id: postId }, data }) : await db.blogPost.create({ data })).id;
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Another post already uses that URL handle." };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/blog/${id}?saved=1`);
}

export async function deletePost(postId: string) {
  await requireAdmin();
  await db.blogPost.delete({ where: { id: postId } });
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}
