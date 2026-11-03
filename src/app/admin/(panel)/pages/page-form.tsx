import { ActionForm, type FormState } from "@/components/action-form";
import { ADMIN_FORM_FOOTER, FORMAT_HINT, SeoFields } from "@/components/admin/content-fields";
import { buttonClass, Card, Checkbox, Field, inputClass } from "@/components/admin/ui";

type PageValues = { title: string; slug: string; body: string; published: boolean; seoTitle: string; seoDescription: string };

export function PageForm({ action, initial }: { action: (formData: FormData) => Promise<FormState>; initial: PageValues }) {
  return (
    <ActionForm
      action={action}
      submitLabel="Save page"
      className="grid gap-6 xl:grid-cols-[1fr_380px] [&>*]:min-w-0"
      footerClassName={ADMIN_FORM_FOOTER}
      buttonClassName={buttonClass()}
    >
      <Card className="space-y-4">
        <Field label="Title">
          <input name="title" required defaultValue={initial.title} className={inputClass} />
        </Field>
        <Field label="Content" hint={FORMAT_HINT}>
          <textarea name="body" required rows={22} defaultValue={initial.body} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
        </Field>
      </Card>
      <div className="space-y-6">
        <Card>
          <Checkbox name="published" label="Published (visible on the store)" defaultChecked={initial.published} />
        </Card>
        <SeoFields seoTitle={initial.seoTitle} seoDescription={initial.seoDescription} slug={initial.slug} slugPrefix="/pages/" />
      </div>
    </ActionForm>
  );
}
