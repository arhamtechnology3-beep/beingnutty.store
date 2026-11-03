import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "product_handle",
  "product_title",
  "rating",
  "title",
  "body",
  "reviewer_name",
  "reviewer_email",
  "location",
  "size",
  "review_date",
  "verified",
  "reply",
];

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

/** One blank row per product with its handle filled in; rows left without a review are ignored on import. */
export async function GET() {
  await requireAdmin();
  const products = await db.product.findMany({
    select: { slug: true, title: true },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });
  const rows = products.map((p) => COLUMNS.map((c) => (c === "product_handle" ? p.slug : c === "product_title" ? p.title : "")));
  const csv = [COLUMNS, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="being-nutty-reviews-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
