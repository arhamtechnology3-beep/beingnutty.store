import { ActionForm, type FormState } from "@/components/action-form";
import { ADMIN_FORM_FOOTER, SeoFields } from "@/components/admin/content-fields";
import { buttonClass, Card, Checkbox, Field, inputClass } from "@/components/admin/ui";

export type CollectionValues = {
  title: string;
  slug: string;
  description: string;
  image: string;
  position: number;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  productIds: string[];
};

export function CollectionForm({
  action,
  initial,
  products,
}: {
  action: (formData: FormData) => Promise<FormState>;
  initial: CollectionValues;
  products: { id: string; title: string; status: string }[];
}) {
  return (
    <ActionForm action={action} submitLabel="Save collection" className="grid gap-6 xl:grid-cols-[1fr_380px] [&>*]:min-w-0" footerClassName={ADMIN_FORM_FOOTER} buttonClassName={buttonClass()}>
      <div className="space-y-6">
        <Card className="space-y-4">
          <Field label="Title">
            <input name="title" required defaultValue={initial.title} className={inputClass} />
          </Field>
          <Field label="Description" hint="Shown at the top of the collection page — describe what's inside in plain words.">
            <textarea name="description" rows={4} maxLength={600} defaultValue={initial.description} className={inputClass} />
          </Field>
        </Card>
        <Card>
          <h2 className="font-semibold">Products in this collection</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2.5 rounded-lg border border-black/10 px-3 py-2 text-sm">
                <input type="checkbox" name="productIds" value={p.id} defaultChecked={initial.productIds.includes(p.id)} className="size-4 accent-[var(--ink)]" />
                <span className="flex-1">{p.title}</span>
                {p.status !== "ACTIVE" ? <span className="text-xs text-black/45">{p.status.toLowerCase()}</span> : null}
              </label>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="space-y-4">
          <Checkbox name="published" label="Published (visible on the store)" defaultChecked={initial.published} />
          <Field label="Sort order" hint="Lower numbers appear first in menus.">
            <input name="position" type="number" min={0} defaultValue={initial.position} className={inputClass} />
          </Field>
          <Field label="Image URL" hint="Optional banner for the collections page.">
            <input name="image" type="url" defaultValue={initial.image} className={inputClass} />
          </Field>
        </Card>
        <SeoFields seoTitle={initial.seoTitle} seoDescription={initial.seoDescription} slug={initial.slug} slugPrefix="/collections/" />
      </div>
    </ActionForm>
  );
}
