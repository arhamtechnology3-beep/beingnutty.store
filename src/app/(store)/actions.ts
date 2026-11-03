"use server";

import { z } from "zod";
import type { FormState } from "@/components/action-form";
import { db } from "@/lib/db";
import { findPurchase } from "@/lib/reviews";

export type NewsletterState = { ok: boolean; message: string } | null;

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { ok: false, message: "Please enter a valid email." };

  await db.customer.upsert({
    where: { email: parsed.data },
    update: { acceptsMarketing: true },
    create: { email: parsed.data, acceptsMarketing: true, tags: ["newsletter"] },
  });
  return { ok: true, message: "You're in. Stay nutty!" };
}

// Bots fill every field; real visitors never see the "website" input.
const isBot = (formData: FormData) => Boolean(String(formData.get("website") ?? ""));

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Please enter a valid email").transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(20),
  message: z.string().trim().min(10, "Please write a little more so we can help").max(3000),
});

export async function submitContact(formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { ok: "Thanks! We'll get back to you soon." };
  const parsed = contactSchema.safeParse(
    Object.fromEntries(["name", "email", "phone", "message"].map((k) => [k, String(formData.get(k) ?? "")])),
  );
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db.contactMessage.create({ data: { ...parsed.data, phone: parsed.data.phone || null } });
  return { ok: "Thanks! We'll get back to you within 1–2 working days." };
}

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(60),
  email: z.union([z.literal(""), z.email("Please enter a valid email")]),
  rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
  location: z.string().trim().max(60),
  title: z.string().trim().max(100),
  body: z.string().trim().min(10, "Please write at least a sentence").max(2000),
});

export async function submitReview(productId: string, formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { ok: "Thanks for your review!" };
  const parsed = reviewSchema.safeParse(
    Object.fromEntries(["name", "email", "rating", "location", "title", "body"].map((k) => [k, String(formData.get(k) ?? "")])),
  );
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const product = await db.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } });
  if (!product) return { error: "This product is no longer available." };

  const d = parsed.data;
  const email = d.email.toLowerCase() || null;
  const purchase = await findPurchase(email, productId);
  await db.review.create({
    data: {
      productId,
      name: d.name,
      email,
      rating: d.rating,
      location: d.location || null,
      title: d.title || null,
      body: d.body,
      verified: Boolean(purchase),
      size: purchase?.size ?? null,
    },
  });
  return { ok: "Thanks for your review! It will appear once our team has checked it." };
}
