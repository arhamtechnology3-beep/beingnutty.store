import Link from "next/link";
import { buildRankingKeywords, chunkKeywords, type KeywordLink } from "@/lib/ranking-keywords";

function KeywordRow({
  items,
  reverse = false,
  muted = false,
  duration = 48,
}: {
  items: KeywordLink[];
  reverse?: boolean;
  muted?: boolean;
  duration?: number;
}) {
  const loop = [...items, ...items];
  return (
    <div className="flex overflow-hidden py-1">
      <div
        className="flex shrink-0 items-center gap-3 pr-3 motion-reduce:animate-none md:gap-4 md:pr-4"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((k, i) => (
          <Link
            key={`${k.href}-${i}`}
            href={k.href}
            className={`whitespace-nowrap text-base font-semibold leading-snug tracking-wide transition-colors md:text-lg ${
              muted ? "text-roast/70 hover:text-ink" : "text-ink hover:text-caramel"
            }`}
          >
            {k.label}
            <span className="mx-3 text-caramel/80 md:mx-4" aria-hidden>
              ·
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Multi-line marquee of ranking keywords → collection or product pages. */
export function KeywordMarquee({
  collections,
  products,
}: {
  collections: { title: string; slug: string }[];
  products: { title: string; slug: string }[];
}) {
  const keywords = buildRankingKeywords({ collections, products });
  const rows = chunkKeywords(keywords, 4);
  if (!keywords.length) return null;

  return (
    <section aria-label="Popular searches" className="overflow-hidden border-y border-line bg-paper py-12 md:py-16">
      <div className="mx-auto mb-8 max-w-[1400px] px-5 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-roast">People search for</p>
        <h2 className="mt-3 font-display text-3xl font-black tracking-tight md:text-5xl">
          Keywords that lead to our cans.
        </h2>
      </div>
      <div className="space-y-4 md:space-y-5">
        <KeywordRow items={rows[0]} duration={90} />
        <KeywordRow items={rows[1]} reverse muted duration={105} />
        <KeywordRow items={rows[2]} duration={85} />
        <KeywordRow items={rows[3]} reverse muted duration={110} />
      </div>
      {/* Crawlable fallback list for SEO (visually hidden but indexable) */}
      <nav aria-label="All ranking keyword links" className="sr-only">
        <ul>
          {keywords.map((k) => (
            <li key={`${k.href}-${k.label}`}>
              <Link href={k.href}>{k.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
