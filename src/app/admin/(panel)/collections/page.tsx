import Link from "next/link";
import { EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections" };

export default async function CollectionsListPage() {
  await requireAdmin();
  const collections = await db.collection.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Collections" description="Group products for menus and collection pages." action={{ href: "/admin/collections/new", label: "Add collection" }} />
      <Table head={["Collection", "Products", "Order", "Status"]}>
        {collections.length === 0 ? <EmptyRow cols={4}>No collections yet.</EmptyRow> : null}
        {collections.map((c) => (
          <tr key={c.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3">
              <Link href={`/admin/collections/${c.id}`} className="font-medium hover:underline">
                {c.title}
              </Link>
              <span className="block font-mono text-xs text-black/50">/collections/{c.slug}</span>
            </td>
            <td className="px-5 py-3 tabular-nums">{c._count.products}</td>
            <td className="px-5 py-3 tabular-nums">{c.position}</td>
            <td className="px-5 py-3">
              <StatusBadge status={c.published ? "PUBLISHED" : "HIDDEN"} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
