import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveProduct } from "../actions";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  const collections = await db.collection.findMany({ orderBy: { position: "asc" }, select: { id: true, title: true } });

  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm
        action={saveProduct.bind(null, null)}
        collections={collections}
        initial={{
          title: "",
          slug: "",
          status: "DRAFT",
          category: "Dryfruit",
          shortDescription: "",
          description: "",
          highlights: "",
          tags: "",
          accentColor: "#d08a3c",
          ingredients: "",
          shelfLife: "",
          storage: "",
          origin: "",
          seoTitle: "",
          seoDescription: "",
          collectionIds: [],
          variants: [],
          faqs: [],
          images: [],
        }}
      />
    </>
  );
}
