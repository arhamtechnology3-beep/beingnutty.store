import { RichText } from "@/components/store/rich-text";
import { SEO_COLLECTIONS } from "@/lib/seo-collections";

/** Long-form SEO / AEO / GEO copy for a collection — DB body first, seed fallback. */
export function CollectionSeo({
  slug,
  title,
  body,
}: {
  slug: string;
  title: string;
  body?: string | null;
}) {
  const seeded = SEO_COLLECTIONS.find((c) => c.slug === slug);
  const text = (body?.trim() || seeded?.body || "").trim();
  if (!text) return null;

  return (
    <div className="space-y-16 md:space-y-20">
      <article className="mx-auto max-w-3xl" aria-labelledby="collection-guide">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-roast">SEO buying guide</p>
        <h2 id="collection-guide" className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">
          About {title}
        </h2>
        <div className="mt-8">
          <RichText text={text} />
        </div>
      </article>

      <aside
        className="mx-auto grid max-w-3xl gap-6 rounded-[1.75rem] border border-line/60 bg-paper/80 p-6 md:grid-cols-3 md:p-8"
        aria-label="Local delivery and trust"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-roast">GEO · India</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Delivered to serviceable pincodes across India. Packed by Arham Foods (Virar East, Maharashtra) for Being Nutty.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-roast">AEO · Answers</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Clear FAQs below cover sizes, raw vs smoked, value per 100 g, gifting and storage — written for people and answer engines.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-roast">SEO · Intent</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            This page targets “{title.toLowerCase()}” shoppers with matching products, structured data and ~1,500+ words of helpful copy.
          </p>
        </div>
      </aside>
    </div>
  );
}
