import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteCollection, saveCollection } from "../actions";
import { CollectionForm } from "../collection-form";

export const metadata = { title: "Edit collection" };

export default async function EditCollectionPage({ params, searchParams }: PageProps<"/admin/collections/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const [collection, products] = await Promise.all([
    db.collection.findUnique({ where: { id }, include: { products: { orderBy: { position: "asc" }, select: { productId: true } } } }),
    db.product.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, status: true } }),
  ]);
  if (!collection) notFound();

  return (
    <>
      <EditorHeader
        title={collection.title}
        saved={Boolean(saved)}
        viewHref={collection.published ? `/collections/${collection.slug}` : undefined}
        onDelete={deleteCollection.bind(null, collection.id)}
      />
      <CollectionForm
        action={saveCollection.bind(null, collection.id)}
        products={products}
        initial={{
          title: collection.title,
          slug: collection.slug,
          description: collection.description ?? "",
          image: collection.image ?? "",
          position: collection.position,
          published: collection.published,
          seoTitle: collection.seoTitle ?? "",
          seoDescription: collection.seoDescription ?? "",
          productIds: collection.products.map((p) => p.productId),
        }}
      />
    </>
  );
}
