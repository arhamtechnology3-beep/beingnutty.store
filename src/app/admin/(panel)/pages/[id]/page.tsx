import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePage, savePage } from "../actions";
import { PageForm } from "../page-form";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({ params, searchParams }: PageProps<"/admin/pages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <>
      <EditorHeader title={page.title} saved={Boolean(saved)} viewHref={page.published ? `/pages/${page.slug}` : undefined} onDelete={deletePage.bind(null, page.id)} />
      <PageForm
        action={savePage.bind(null, page.id)}
        initial={{
          title: page.title,
          slug: page.slug,
          body: page.body,
          published: page.published,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
        }}
      />
    </>
  );
}
