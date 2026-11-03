import Link from "next/link";
import { EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog" };

export default async function BlogListPage() {
  await requireAdmin();
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="Blog" description="Articles for the Nutty Journal — great for Google and AI answers." action={{ href: "/admin/blog/new", label: "Write post" }} />
      <Table head={["Title", "Author", "Status", "Published"]}>
        {posts.length === 0 ? <EmptyRow cols={4}>No posts yet.</EmptyRow> : null}
        {posts.map((p) => (
          <tr key={p.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3">
              <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <span className="block font-mono text-xs text-black/50">/blog/{p.slug}</span>
            </td>
            <td className="px-5 py-3">{p.author}</td>
            <td className="px-5 py-3">
              <StatusBadge status={p.publishedAt ? "PUBLISHED" : "DRAFT"} />
            </td>
            <td className="px-5 py-3 text-black/60">{p.publishedAt ? p.publishedAt.toLocaleDateString("en-IN") : "—"}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
