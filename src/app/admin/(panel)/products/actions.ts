"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export type ProductFormState = { error?: string } | null;

const rupees = z.coerce.number().min(0).max(1_000_000).transform((v) => Math.round(v * 100));

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Every variant needs a title"),
  sku: z.string().trim().min(1, "Every variant needs a SKU"),
  price: rupees,
  compareAtPrice: z.union([z.literal("").transform(() => null), z.null(), rupees]).optional(),
  weightGrams: z.union([z.literal("").transform(() => null), z.null(), z.coerce.number().int().min(0)]).optional(),
  packaging: z.string().trim().optional(),
  inventoryQty: z.coerce.number().int(),
  trackInventory: z.boolean(),
});

const schema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z.string().trim(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  category: z.string().trim().min(1),
  shortDescription: z.string().trim(),
  description: z.string().trim(),
  highlights: z.string(),
  tags: z.string(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Accent colour must be a hex value like #d08a3c"),
  ingredients: z.string().trim(),
  shelfLife: z.string().trim(),
  storage: z.string().trim(),
  origin: z.string().trim(),
  seoTitle: z.string().trim().max(70, "SEO title should be under 70 characters"),
  seoDescription: z.string().trim().max(170, "SEO description should be under 170 characters"),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
  faqs: z.array(z.object({ q: z.string().trim(), a: z.string().trim() })),
  images: z.array(
    z.object({
      url: z
        .string()
        .trim()
        .refine((v) => v.startsWith("/") || URL.canParse(v), "Image URLs must start with / or https://"),
      alt: z.string().trim(),
      variantId: z.string().nullish(),
    }),
  ),
  collectionIds: z.array(z.string()),
});

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const orNull = (s: string) => (s ? s : null);

export async function saveProduct(productId: string | null, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  let parsedJson: { variants: unknown; faqs: unknown; images: unknown };
  try {
    parsedJson = {
      variants: JSON.parse(String(formData.get("variants") ?? "[]")),
      faqs: JSON.parse(String(formData.get("faqs") ?? "[]")),
      images: JSON.parse(String(formData.get("images") ?? "[]")),
    };
  } catch {
    return { error: "Could not read the form. Please try again." };
  }

  const parsed = schema.safeParse({
    ...Object.fromEntries(
      [
        "title", "slug", "status", "category", "shortDescription", "description", "highlights", "tags",
        "accentColor", "ingredients", "shelfLife", "storage", "origin", "seoTitle", "seoDescription",
      ].map((k) => [k, String(formData.get(k) ?? "")]),
    ),
    ...parsedJson,
    collectionIds: formData.getAll("collectionIds").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;

  const data = {
    title: d.title,
    slug: slugify(d.slug || d.title),
    status: d.status,
    category: d.category,
    shortDescription: orNull(d.shortDescription),
    description: orNull(d.description),
    highlights: lines(d.highlights),
    tags: d.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    accentColor: d.accentColor,
    ingredients: orNull(d.ingredients),
    shelfLife: orNull(d.shelfLife),
    storage: orNull(d.storage),
    origin: orNull(d.origin),
    seoTitle: orNull(d.seoTitle),
    seoDescription: orNull(d.seoDescription),
    faqs: d.faqs.filter((f) => f.q && f.a),
  };

  let id = productId;
  try {
    id = await db.$transaction(async (tx) => {
      const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });

      const keep = d.variants.map((v) => v.id).filter((v): v is string => Boolean(v));
      await tx.productVariant.deleteMany({ where: { productId: product.id, id: { notIn: keep } } });
      for (const [position, v] of d.variants.entries()) {
        const variant = {
          title: v.title,
          sku: v.sku.toUpperCase(),
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          weightGrams: v.weightGrams ?? null,
          packaging: v.packaging || null,
          inventoryQty: v.inventoryQty,
          trackInventory: v.trackInventory,
          position,
        };
        if (v.id) await tx.productVariant.update({ where: { id: v.id, productId: product.id }, data: variant });
        else await tx.productVariant.create({ data: { ...variant, productId: product.id } });
      }

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (d.images.length) {
        const variantIds = new Set(keep);
        await tx.productImage.createMany({
          data: d.images.map((img, position) => ({
            productId: product.id,
            url: img.url,
            alt: img.alt || d.title,
            position,
            variantId: img.variantId && variantIds.has(img.variantId) ? img.variantId : null,
          })),
        });
      }

      await tx.productCollection.deleteMany({ where: { productId: product.id } });
      if (d.collectionIds.length) {
        await tx.productCollection.createMany({
          data: d.collectionIds.map((collectionId) => ({ productId: product.id, collectionId })),
        });
      }
      return product.id;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "That URL handle or SKU is already used by another product." };
    }
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await db.product.delete({ where: { id: productId } });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
