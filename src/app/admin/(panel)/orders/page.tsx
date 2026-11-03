import Link from "next/link";
import { EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import type { OrderStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "To fulfil", statuses: ["CONFIRMED", "PROCESSING"] },
  { key: "shipped", label: "Shipped", statuses: ["SHIPPED"] },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"] },
  { key: "pending", label: "Unpaid", statuses: ["PENDING"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REFUNDED"] },
];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const { status = "all", q } = await searchParams;
  const filter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];
  const query = typeof q === "string" ? q.trim() : "";
  const number = Number(query.replace("#", ""));

  const orders = await db.order.findMany({
    where: {
      ...(filter.statuses ? { status: { in: filter.statuses } } : {}),
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query } },
              ...(Number.isInteger(number) && number > 0 ? [{ number }] : []),
            ],
          }
        : {}),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader title="Orders" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-xl bg-white p-1 ring-1 ring-black/10" aria-label="Order filters">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/orders?status=${f.key}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                f.key === filter.key ? "bg-ink text-paper" : "text-black/60 hover:bg-black/5",
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          <input type="hidden" name="status" value={filter.key} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search #, email, phone"
            aria-label="Search orders"
            className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
          />
        </form>
      </div>
      <Table head={["Order", "Date", "Customer", "Source", "Items", "Payment", "Status", "Total"]}>
        {orders.length === 0 ? <EmptyRow cols={8}>No orders found.</EmptyRow> : null}
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3 font-semibold">
              <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                #{o.number}
              </Link>
            </td>
            <td className="whitespace-nowrap px-5 py-3 text-black/60">
              {o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </td>
            <td className="px-5 py-3">{o.email}</td>
            <td className="max-w-[140px] truncate px-5 py-3 text-xs text-black/60" title={o.sourceChannel ?? "Direct / Website"}>
              {o.sourceChannel ?? "Direct / Website"}
            </td>
            <td className="px-5 py-3">{o._count.items}</td>
            <td className="px-5 py-3">
              <span className="mr-2 text-xs text-black/50">{o.paymentMethod === "COD" ? "COD" : "Online"}</span>
              <StatusBadge status={o.paymentStatus} />
            </td>
            <td className="px-5 py-3">
              <StatusBadge status={o.status} />
            </td>
            <td className="px-5 py-3 font-semibold tabular-nums">{formatINR(o.total)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
