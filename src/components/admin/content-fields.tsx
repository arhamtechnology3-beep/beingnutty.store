import { Card, Field, inputClass } from "./ui";

export function SeoFields({ seoTitle, seoDescription, slug, slugPrefix }: { seoTitle: string; seoDescription: string; slug: string; slugPrefix: string }) {
  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">Search engine listing</h2>
      <Field label="URL handle" hint={`Shown as ${slugPrefix}<handle>. Leave blank to generate from the title.`}>
        <input name="slug" defaultValue={slug} className={inputClass} />
      </Field>
      <Field label="SEO title" hint="Up to 70 characters. Defaults to the title.">
        <input name="seoTitle" maxLength={70} defaultValue={seoTitle} className={inputClass} />
      </Field>
      <Field label="SEO description" hint="Up to 170 characters. A clear one-sentence summary works best for Google and AI answers.">
        <textarea name="seoDescription" maxLength={170} rows={3} defaultValue={seoDescription} className={inputClass} />
      </Field>
    </Card>
  );
}

/** Sticky save bar spanning both columns of a two-column admin editor. */
export const ADMIN_FORM_FOOTER =
  "sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-4 border-t border-black/10 bg-[#f4f2ee]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8 xl:col-span-2";

export const FORMAT_HINT = "Blank line = new paragraph. Start a line with “## ” for a heading and “- ” for a bullet list.";
