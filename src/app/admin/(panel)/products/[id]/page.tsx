import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProduct, saveProduct } from "../actions";

export const metadata = { title: "Edit product" };

const rupees = (paise: number | null) => (paise === null ? "" : String(paise / 100));

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;

  const [product, collections] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { position: "asc" } },
        images: { orderBy: { position: "asc" } },
        collections: true,
      },
    }),
    db.collection.findMany({ orderBy: { position: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <EditorHeader
        title={product.title}
        saved={Boolean(saved)}
        viewHref={product.status === "ACTIVE" ? `/products/${product.slug}` : undefined}
        onDelete={deleteProduct.bind(null, product.id)}
      />
      <ProductForm
        action={saveProduct.bind(null, product.id)}
        collections={collections}
        initial={{
          title: product.title,
          slug: product.slug,
          status: product.status,
          category: product.category,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          highlights: product.highlights.join("\n"),
          tags: product.tags.join(", "),
          accentColor: product.accentColor ?? "#d08a3c",
          ingredients: product.ingredients ?? "",
          shelfLife: product.shelfLife ?? "",
          storage: product.storage ?? "",
          origin: product.origin ?? "",
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          collectionIds: product.collections.map((c) => c.collectionId),
          faqs: (Array.isArray(product.faqs) ? product.faqs : []) as { q: string; a: string }[],
          images: product.images.map((i) => ({ url: i.url, alt: i.alt, variantId: i.variantId })),
          variants: product.variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            price: rupees(v.price),
            compareAtPrice: rupees(v.compareAtPrice),
            weightGrams: v.weightGrams === null ? "" : String(v.weightGrams),
            packaging: v.packaging ?? "",
            inventoryQty: String(v.inventoryQty),
            trackInventory: v.trackInventory,
          })),
        }}
      />
    </>
  );
}
