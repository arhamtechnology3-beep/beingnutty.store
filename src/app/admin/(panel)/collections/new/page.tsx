import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveCollection } from "../actions";
import { CollectionForm } from "../collection-form";

export const metadata = { title: "Add collection" };

export default async function NewCollectionPage() {
  await requireAdmin();
  const products = await db.product.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, status: true } });
  return (
    <>
      <PageHeader title="Add collection" />
      <CollectionForm
        action={saveCollection.bind(null, null)}
        products={products}
        initial={{ title: "", slug: "", description: "", image: "", position: 0, published: true, seoTitle: "", seoDescription: "", productIds: [] }}
      />
    </>
  );
}
