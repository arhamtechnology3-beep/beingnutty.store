import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { AddReviewForm, ImportReviewsForm } from "@/components/admin/add-review-form";
import { buttonClass, EmptyRow, inputClass, PageHeader, RowAction, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { deleteReview, saveReviewReply, setReviewApproved } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
] as const;

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const { show } = await searchParams;
  const filter = FILTERS.find((f) => f.key === show)?.key ?? "pending";

  const [products, reviews, stats, pending] = await Promise.all([
    db.product.findMany({
      select: { id: true, slug: true, title: true, variants: { select: { title: true }, orderBy: { position: "asc" } } },
      orderBy: { title: "asc" },
    }),
    db.review.findMany({
      where: filter === "all" ? undefined : { approved: filter === "approved" },
      include: { product: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.review.aggregate({ where: { approved: true }, _avg: { rating: true }, _count: true }),
    db.review.count({ where: { approved: false } }),
  ]);

  return (
    <>
      <PageHeader title="Reviews" description="Reviews customers write on the site stay hidden until you approve them." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Published", value: stats._count },
          { label: "Average rating", value: stats._avg.rating ? `${stats._avg.rating.toFixed(1)} ★` : "—" },
          { label: "Waiting for approval", value: pending },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-black/10 bg-white px-5 py-4">
            <p className="text-sm text-black/60">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-6 grid gap-3">
        <AddReviewForm products={products.map((p) => ({ id: p.id, title: p.title, sizes: p.variants.map((v) => v.title) }))} />
        <ImportReviewsForm products={products} />
      </div>
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/reviews?show=${f.key}`}
            className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", filter === f.key ? "bg-ink text-paper" : "bg-white ring-1 ring-black/10")}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <Table head={["Review", "Product", "Rating", "Status", ""]}>
        {reviews.length === 0 ? <EmptyRow cols={5}>No reviews here.</EmptyRow> : null}
        {reviews.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="max-w-md px-5 py-3">
              {r.title ? <p className="font-semibold">{r.title}</p> : null}
              <p className="text-black/70">{r.body}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-black/50">
                {r.name}
                {r.location ? ` · ${r.location}` : ""}
                {r.email ? ` · ${r.email}` : ""}
                {r.size ? ` · ${r.size}` : ""} · {r.createdAt.toLocaleDateString("en-IN")}
                {r.verified ? (
                  <span className="ml-1 inline-flex items-center gap-0.5 font-semibold text-green-700">
                    <BadgeCheck className="size-3.5" aria-hidden /> Verified buyer
                  </span>
                ) : null}
              </p>
              <details className="mt-2" open={Boolean(r.reply)}>
                <summary className="cursor-pointer text-xs font-semibold text-black/60">{r.reply ? "Your reply" : "Reply publicly"}</summary>
                <form action={saveReviewReply.bind(null, r.id)} className="mt-2 grid gap-2">
                  <textarea name="reply" rows={2} defaultValue={r.reply ?? ""} placeholder="Thank you for…" className={inputClass} />
                  <button type="submit" className={cn(buttonClass("secondary"), "justify-self-start px-3 py-1.5 text-xs")}>
                    Save reply
                  </button>
                </form>
              </details>
            </td>
            <td className="px-5 py-3">
              <Link href={`/products/${r.product.slug}#reviews-title`} target="_blank" className="hover:underline">
                {r.product.title}
              </Link>
            </td>
            <td className="whitespace-nowrap px-5 py-3 font-semibold">{"★".repeat(r.rating)}</td>
            <td className="px-5 py-3">
              <StatusBadge status={r.approved ? "APPROVED" : "PENDING"} />
            </td>
            <td className="px-5 py-3">
              <div className="flex justify-end gap-2">
                <RowAction action={setReviewApproved.bind(null, r.id, !r.approved)} label={r.approved ? "Hide" : "Approve"} />
                <RowAction action={deleteReview.bind(null, r.id)} label="Delete" variant="danger" />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
