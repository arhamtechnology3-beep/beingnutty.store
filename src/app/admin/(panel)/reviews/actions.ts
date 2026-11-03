"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { csvRecords } from "@/lib/csv";
import { db } from "@/lib/db";
import { findPurchase } from "@/lib/reviews";

async function refresh(productIds: string[]) {
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { slug: true } });
  for (const p of products) revalidatePath(`/products/${p.slug}`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/reviews");
}

export async function setReviewApproved(id: string, approved: boolean) {
  await requireAdmin();
  const review = await db.review.update({ where: { id }, data: { approved } });
  await refresh([review.productId]);
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const review = await db.review.delete({ where: { id } });
  await refresh([review.productId]);
}

export async function saveReviewReply(id: string, formData: FormData) {
  await requireAdmin();
  const reply = String(formData.get("reply") ?? "").trim().slice(0, 1000);
  const review = await db.review.update({
    where: { id },
    data: { reply: reply || null, repliedAt: reply ? new Date() : null },
  });
  await refresh([review.productId]);
}

const received = z.object({
  productId: z.string().min(1, "Pick a product"),
  name: z.string().trim().min(2, "Add the customer's name").max(60),
  email: z.union([z.literal(""), z.email("That email doesn't look right")]),
  location: z.string().trim().max(60),
  size: z.string().trim().max(30),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120),
  body: z.string().trim().min(5, "Add the review text"),
  date: z.union([z.literal(""), z.iso.date()]),
  verified: z.literal("on").optional(),
});

export type AddReviewState = { error?: string; ok?: boolean } | null;

/** Adds a review a customer sent another way (WhatsApp, Instagram, in person), already approved. */
export async function addReceivedReview(_prev: AddReviewState, formData: FormData): Promise<AddReviewState> {
  await requireAdmin();
  const parsed = received.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;
  const email = d.email.toLowerCase() || null;
  const purchase = await findPurchase(email, d.productId);
  await db.review.create({
    data: {
      productId: d.productId,
      name: d.name,
      email,
      location: d.location || null,
      size: d.size || purchase?.size || null,
      rating: d.rating,
      title: d.title || null,
      body: d.body,
      verified: Boolean(d.verified || purchase),
      approved: true,
      ...(d.date ? { createdAt: new Date(d.date) } : {}),
    },
  });
  await refresh([d.productId]);
  return { ok: true };
}

const pick = (row: Record<string, string>, ...keys: string[]) => keys.map((k) => row[k]).find(Boolean) ?? "";
const yes = (v: string) => /^(1|true|yes|y|verified|published|approved|ok)$/i.test(v);

/** Reads 2026-09-14, 14/09/2026, 14-09-26 (day first, as Excel saves them in India) or "14 Sep 2026". */
function date(v: string) {
  const s = v.trim();
  if (!s) return undefined;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(?:\s|$)/);
  let d: Date;
  if (iso || dmy) {
    const [y, m, day] = iso ? [+iso[1], +iso[2], +iso[3]] : [+dmy![3] + (dmy![3].length === 2 ? 2000 : 0), +dmy![2], +dmy![1]];
    d = new Date(Date.UTC(y, m - 1, day, 6, 30));
    if (d.getUTCMonth() !== m - 1 || d.getUTCDate() !== day) return undefined;
  } else {
    d = new Date(s);
  }
  return Number.isNaN(d.getTime()) || d.getTime() > Date.now() ? undefined : d;
}

export type ImportReviewsState = { error?: string; imported?: number; skipped?: string[] } | null;

/**
 * Imports a CSV exported from Judge.me, Shopify Product Reviews, Loox or a spreadsheet.
 * Products are matched on handle/slug or title.
 */
export async function importReviews(_prev: ImportReviewsState, formData: FormData): Promise<ImportReviewsState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose a CSV file." };
  if (file.size > 2_000_000) return { error: "That file is over 2 MB — split it into smaller files." };
  const publish = formData.get("publish") === "on";

  const rows = csvRecords(await file.text());
  if (!rows.length) return { error: "The file has no rows under the header." };
  if (!rows.some((r) => pick(r, "body", "review", "content", "review_body", "text"))) {
    return { error: "No reviews found — fill in at least rating, body and reviewer_name on a row." };
  }

  const products = await db.product.findMany({ select: { id: true, slug: true, title: true } });
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const lookup = new Map<string, string>();
  for (const p of products) {
    lookup.set(norm(p.slug), p.id);
    lookup.set(norm(p.title), p.id);
    lookup.set(norm(p.title.split("—")[0]), p.id);
  }

  const skipped: string[] = [];
  const touched = new Set<string>();
  let imported = 0;

  for (const [i, row] of rows.entries()) {
    const line = `Row ${i + 2}`;
    const product = pick(row, "product_handle", "handle", "product_slug", "slug", "product", "product_title");
    const productId = lookup.get(norm(product));
    const name = pick(row, "reviewer_name", "author", "name", "customer_name", "customer");
    const body = pick(row, "body", "review", "content", "review_body", "text");
    const ratingText = pick(row, "rating", "stars", "score");
    const rating = Math.round(Number(ratingText));
    const dateText = pick(row, "review_date", "created_at", "date");

    if (!name && !body && !ratingText) continue;
    if (!productId) {
      skipped.push(`${line}: no product matches "${product || "(blank)"}"`);
      continue;
    }
    if (!name || !body) {
      skipped.push(`${line}: missing reviewer name or review text`);
      continue;
    }
    if (!(rating >= 1 && rating <= 5)) {
      skipped.push(`${line}: rating must be 1–5`);
      continue;
    }
    if (dateText && !date(dateText)) {
      skipped.push(`${line}: can't read the date "${dateText}" — use DD/MM/YYYY`);
      continue;
    }
    const duplicate = await db.review.findFirst({ where: { productId, name, body }, select: { id: true } });
    if (duplicate) {
      skipped.push(`${line}: already imported`);
      continue;
    }

    const email = pick(row, "reviewer_email", "email").toLowerCase() || null;
    const purchase = await findPurchase(email, productId);
    const state = pick(row, "state", "curated", "status", "published");
    const reply = pick(row, "reply", "store_reply", "response") || null;

    await db.review.create({
      data: {
        productId,
        name: name.slice(0, 60),
        email,
        rating,
        title: pick(row, "title", "review_title").slice(0, 120) || null,
        body: body.slice(0, 4000),
        location: pick(row, "location", "reviewer_location", "city").slice(0, 60) || null,
        size: pick(row, "size", "variant", "variant_title").slice(0, 30) || purchase?.size || null,
        verified: yes(pick(row, "verified", "verified_buyer", "verified_purchase")) || Boolean(purchase),
        reply,
        repliedAt: reply ? (date(pick(row, "reply_date", "replied_at")) ?? new Date()) : null,
        approved: state ? yes(state) : publish,
        createdAt: date(dateText),
      },
    });
    touched.add(productId);
    imported++;
  }

  if (touched.size) await refresh([...touched]);
  return { imported, skipped };
}
