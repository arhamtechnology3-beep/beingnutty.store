"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ProductFormState } from "@/app/admin/(panel)/products/actions";
import { buttonClass, Card, inputClass } from "./ui";

export type ProductFormValues = {
  title: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category: string;
  shortDescription: string;
  description: string;
  highlights: string;
  tags: string;
  accentColor: string;
  ingredients: string;
  shelfLife: string;
  storage: string;
  origin: string;
  seoTitle: string;
  seoDescription: string;
  collectionIds: string[];
  variants: VariantRow[];
  faqs: { q: string; a: string }[];
  images: { url: string; alt: string; variantId?: string | null }[];
};

type VariantRow = {
  id?: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  weightGrams: string;
  packaging: string;
  inventoryQty: string;
  trackInventory: boolean;
};

const emptyVariant: VariantRow = {
  title: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  weightGrams: "",
  packaging: "",
  inventoryQty: "0",
  trackInventory: true,
};

export function ProductForm({
  initial,
  collections,
  action,
}: {
  initial: ProductFormValues;
  collections: { id: string; title: string }[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [variants, setVariants] = useState<VariantRow[]>(initial.variants.length ? initial.variants : [emptyVariant]);
  const [faqs, setFaqs] = useState(initial.faqs);
  const [images, setImages] = useState(initial.images);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);

  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_340px] [&>*]:min-w-0">
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
      <input type="hidden" name="images" value={JSON.stringify(images.filter((i) => i.url))} />

      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <Field label="Title">
              <input name="title" defaultValue={initial.title} required className={inputClass} />
            </Field>
            <Field label="Short description" hint="One line shown under the title and on cards.">
              <input name="shortDescription" defaultValue={initial.shortDescription} className={inputClass} />
            </Field>
            <Field label="Description">
              <textarea name="description" defaultValue={initial.description} rows={5} className={inputClass} />
            </Field>
            <Field label="Highlights" hint="One per line.">
              <textarea name="highlights" defaultValue={initial.highlights} rows={3} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Variants</h2>
            <button type="button" className={buttonClass("secondary")} onClick={() => setVariants((v) => [...v, emptyVariant])}>
              <Plus className="size-4" /> Add variant
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {variants.map((v, i) => (
              <div key={v.id ?? `new-${i}`} className="rounded-xl border border-black/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Title (e.g. 250g)">
                    <input value={v.title} onChange={(e) => updateVariant(i, { title: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="SKU">
                    <input value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="Price (₹)">
                    <input type="number" step="0.01" min="0" value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="Compare-at price (₹)">
                    <input type="number" step="0.01" min="0" value={v.compareAtPrice} onChange={(e) => updateVariant(i, { compareAtPrice: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Weight (g)">
                    <input type="number" min="0" value={v.weightGrams} onChange={(e) => updateVariant(i, { weightGrams: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Packaging">
                    <input value={v.packaging} onChange={(e) => updateVariant(i, { packaging: e.target.value })} placeholder="500 ml can" className={inputClass} />
                  </Field>
                  <Field label="Inventory">
                    <input type="number" value={v.inventoryQty} onChange={(e) => updateVariant(i, { inventoryQty: e.target.value })} className={inputClass} />
                  </Field>
                  <div className="flex items-end justify-between gap-3">
                    <label className="flex items-center gap-2 pb-2.5 text-sm">
                      <input type="checkbox" checked={v.trackInventory} onChange={(e) => updateVariant(i, { trackInventory: e.target.checked })} />
                      Track stock
                    </label>
                    {variants.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setVariants((rows) => rows.filter((_, idx) => idx !== i))}
                        className={buttonClass("danger")}
                        aria-label={`Remove variant ${v.title || i + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Images</h2>
            <button type="button" className={buttonClass("secondary")} onClick={() => setImages((im) => [...im, { url: "", alt: "", variantId: null }])}>
              <Plus className="size-4" /> Add image URL
            </button>
          </div>
          <p className="mt-1 text-sm text-black/55">
            Pick a size under &ldquo;Show for&rdquo; to make a photo lead the gallery when that size is selected. Until photos are added, the
            store shows an illustrated can in the accent colour.
          </p>
          <div className="mt-4 space-y-3">
            {images.map((img, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[2fr_1fr_140px_auto]">
                <input
                  value={img.url}
                  onChange={(e) => setImages((rows) => rows.map((r, idx) => (idx === i ? { ...r, url: e.target.value } : r)))}
                  placeholder="https://…"
                  className={inputClass}
                  aria-label="Image URL"
                />
                <input
                  value={img.alt}
                  onChange={(e) => setImages((rows) => rows.map((r, idx) => (idx === i ? { ...r, alt: e.target.value } : r)))}
                  placeholder="Alt text (describe the image)"
                  className={inputClass}
                  aria-label="Alt text"
                />
                <select
                  value={img.variantId ?? ""}
                  onChange={(e) => setImages((rows) => rows.map((r, idx) => (idx === i ? { ...r, variantId: e.target.value || null } : r)))}
                  className={inputClass}
                  aria-label="Show for size"
                >
                  <option value="">All sizes</option>
                  {variants
                    .filter((v) => v.id)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title || v.sku}
                      </option>
                    ))}
                </select>
                <button type="button" onClick={() => setImages((rows) => rows.filter((_, idx) => idx !== i))} className={buttonClass("danger")} aria-label="Remove image">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">FAQs</h2>
            <button type="button" className={buttonClass("secondary")} onClick={() => setFaqs((f) => [...f, { q: "", a: "" }])}>
              <Plus className="size-4" /> Add question
            </button>
          </div>
          <p className="mt-1 text-sm text-black/55">Shown on the product page and published as FAQ structured data for Google and AI answers.</p>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-black/10 p-3">
                <input
                  value={f.q}
                  onChange={(e) => setFaqs((rows) => rows.map((r, idx) => (idx === i ? { ...r, q: e.target.value } : r)))}
                  placeholder="Question"
                  className={inputClass}
                  aria-label="Question"
                />
                <div className="flex gap-2">
                  <textarea
                    value={f.a}
                    onChange={(e) => setFaqs((rows) => rows.map((r, idx) => (idx === i ? { ...r, a: e.target.value } : r)))}
                    placeholder="Answer"
                    rows={2}
                    className={inputClass}
                    aria-label="Answer"
                  />
                  <button type="button" onClick={() => setFaqs((rows) => rows.filter((_, idx) => idx !== i))} className={buttonClass("danger")} aria-label="Remove question">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Search engine listing</h2>
          <div className="mt-4 rounded-xl bg-black/[0.03] p-4">
            <p className="truncate text-lg text-[#1a0dab]">{seoTitle || initial.title || "Product title"} | Being Nutty</p>
            <p className="line-clamp-2 text-sm text-black/60">{seoDescription || initial.shortDescription || "Description shown in search results."}</p>
          </div>
          <div className="mt-4 space-y-4">
            <Field label={`SEO title (${seoTitle.length}/70)`}>
              <input name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} className={inputClass} />
            </Field>
            <Field label={`SEO description (${seoDescription.length}/170)`}>
              <textarea name="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={170} rows={3} className={inputClass} />
            </Field>
            <Field label="URL handle" hint="Leave blank to generate from the title.">
              <input name="slug" defaultValue={initial.slug} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <Field label="Status">
            <select name="status" defaultValue={initial.status} className={inputClass}>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          {state?.error ? (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              {state.error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className={`${buttonClass()} mt-4 w-full`}>
            {pending ? "Saving…" : "Save product"}
          </button>
        </Card>

        <Card>
          <div className="space-y-4">
            <Field label="Category">
              <input name="category" defaultValue={initial.category} className={inputClass} />
            </Field>
            <Field label="Tags" hint="Comma separated, e.g. cashew, roasted">
              <input name="tags" defaultValue={initial.tags} className={inputClass} />
            </Field>
            <Field label="Accent colour">
              <input name="accentColor" type="color" defaultValue={initial.accentColor} className="h-11 w-full cursor-pointer rounded-lg border border-black/15" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Collections</h2>
          <div className="mt-3 space-y-2">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="collectionIds" value={c.id} defaultChecked={initial.collectionIds.includes(c.id)} />
                {c.title}
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Product details</h2>
          <div className="mt-4 space-y-4">
            <Field label="Ingredients">
              <input name="ingredients" defaultValue={initial.ingredients} className={inputClass} />
            </Field>
            <Field label="Shelf life">
              <input name="shelfLife" defaultValue={initial.shelfLife} className={inputClass} />
            </Field>
            <Field label="Storage">
              <input name="storage" defaultValue={initial.storage} className={inputClass} />
            </Field>
            <Field label="Origin">
              <input name="origin" defaultValue={initial.origin} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-black/50">{hint}</span> : null}
    </label>
  );
}
