import { ActionForm, type FormState } from "@/components/action-form";
import { ADMIN_FORM_FOOTER, FORMAT_HINT, SeoFields } from "@/components/admin/content-fields";
import { buttonClass, Card, Checkbox, Field, inputClass } from "@/components/admin/ui";

export type PostValues = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  author: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

export function PostForm({ action, initial }: { action: (formData: FormData) => Promise<FormState>; initial: PostValues }) {
  return (
    <ActionForm action={action} submitLabel="Save post" className="grid gap-6 xl:grid-cols-[1fr_380px] [&>*]:min-w-0" footerClassName={ADMIN_FORM_FOOTER} buttonClassName={buttonClass()}>
      <Card className="space-y-4">
        <Field label="Title">
          <input name="title" required defaultValue={initial.title} className={inputClass} />
        </Field>
        <Field label="Excerpt" hint="One or two sentences shown on the journal page and in search results.">
          <textarea name="excerpt" rows={2} maxLength={300} defaultValue={initial.excerpt} className={inputClass} />
        </Field>
        <Field label="Article" hint={FORMAT_HINT}>
          <textarea name="body" required rows={24} defaultValue={initial.body} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
        </Field>
      </Card>
      <div className="space-y-6">
        <Card className="space-y-4">
          <Checkbox name="published" label="Published (visible on the journal)" defaultChecked={initial.published} />
          <Field label="Author">
            <input name="author" defaultValue={initial.author} className={inputClass} />
          </Field>
          <Field label="Cover image URL" hint="Optional. Upload to Supabase Storage and paste the public URL.">
            <input name="coverImage" type="url" defaultValue={initial.coverImage} className={inputClass} />
          </Field>
        </Card>
        <SeoFields seoTitle={initial.seoTitle} seoDescription={initial.seoDescription} slug={initial.slug} slugPrefix="/blog/" />
      </div>
    </ActionForm>
  );
}
