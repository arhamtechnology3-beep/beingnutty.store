import Link from "next/link";
import { EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pages" };

export default async function PagesListPage() {
  await requireAdmin();
  const pages = await db.page.findMany({ orderBy: { title: "asc" } });

  return (
    <>
      <PageHeader title="Pages" description="About, policies, contact and other content pages." action={{ href: "/admin/pages/new", label: "Add page" }} />
      <Table head={["Title", "URL", "Status", "Updated"]}>
        {pages.length === 0 ? <EmptyRow cols={4}>No pages yet.</EmptyRow> : null}
        {pages.map((p) => (
          <tr key={p.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3">
              <Link href={`/admin/pages/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
            </td>
            <td className="px-5 py-3 font-mono text-xs text-black/60">/pages/{p.slug}</td>
            <td className="px-5 py-3">
              <StatusBadge status={p.published ? "PUBLISHED" : "HIDDEN"} />
            </td>
            <td className="px-5 py-3 text-black/60">{p.updatedAt.toLocaleDateString("en-IN")}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
