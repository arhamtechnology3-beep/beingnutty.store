import Link from "next/link";
import { EmptyRow, PageHeader, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const customers = await db.customer.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { firstName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { orders: { where: { status: { notIn: ["CANCELLED", "PENDING"] } }, select: { total: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} customers`} />
      <form className="mb-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, email, phone"
          aria-label="Search customers"
          className="w-full max-w-sm rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
        />
      </form>
      <Table head={["Customer", "Phone", "Marketing", "Orders", "Total spent", "Joined"]}>
        {customers.length === 0 ? <EmptyRow cols={6}>No customers yet.</EmptyRow> : null}
        {customers.map((c) => (
          <tr key={c.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3">
              <Link href={`/admin/customers/${c.id}`} className="block font-medium hover:underline">
                {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
              </Link>
              <span className="text-black/55">{c.email}</span>
            </td>
            <td className="px-5 py-3">{c.phone ?? "—"}</td>
            <td className="px-5 py-3">{c.acceptsMarketing ? "Subscribed" : "—"}</td>
            <td className="px-5 py-3">{c.orders.length}</td>
            <td className="px-5 py-3 font-semibold tabular-nums">{formatINR(c.orders.reduce((s, o) => s + o.total, 0))}</td>
            <td className="px-5 py-3 text-black/60">{c.createdAt.toLocaleDateString("en-IN")}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
