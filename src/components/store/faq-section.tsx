import type { Faq } from "@/lib/faq-builder";
import { FaqList } from "./faq-list";

/** Product or collection questions, followed by the shared ordering & delivery questions. */
export function FaqSection({ id, title, faqs, ordering }: { id: string; title: string; faqs: Faq[]; ordering: Faq[] }) {
  return (
    <section className="grid gap-10 md:grid-cols-[1fr_2fr]" aria-labelledby={id}>
      <div>
        <h2 id={id} className="font-display text-4xl font-black tracking-tight md:sticky md:top-28">
          {title}
        </h2>
      </div>
      <div className="min-w-0">
        <FaqList faqs={faqs} />
        {ordering.length ? (
          <>
            <h3 className="mb-2 mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-roast">Ordering &amp; delivery</h3>
            <FaqList faqs={ordering} />
          </>
        ) : null}
      </div>
    </section>
  );
}
