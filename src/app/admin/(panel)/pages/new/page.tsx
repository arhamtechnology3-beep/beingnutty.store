import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { savePage } from "../actions";
import { PageForm } from "../page-form";

export const metadata = { title: "Add page" };

export default async function NewPagePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add page" />
      <PageForm action={savePage.bind(null, null)} initial={{ title: "", slug: "", body: "", published: true, seoTitle: "", seoDescription: "" }} />
    </>
  );
}
