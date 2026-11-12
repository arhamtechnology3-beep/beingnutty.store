import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CollectionsSlider } from "./collections-slider";

export type HomeCollection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  productCount: number;
  /** Short product names so cans are visible despite long SEO collection titles */
  productNames: string[];
};

/** Homepage shelf of every published collection — sliding cards, not a grid list. */
export function CollectionsGrid({ collections }: { collections: HomeCollection[] }) {
  if (!collections.length) return null;

  return (
    <section aria-labelledby="collections-home-title" className="overflow-hidden py-28 md:py-36">
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-6 px-5 md:flex-row md:items-end md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-roast">Shop by need</p>
          <h2 id="collections-home-title" className="mt-3 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
            Every collection,
            <br />
            <span className="italic text-caramel">one shelf.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-roast">
            From buy cashews online to Diwali gift packs — {collections.length} curated pages with the matching Being Nutty cans.
          </p>
        </div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 self-start rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper md:self-auto"
        >
          View all collections
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <CollectionsSlider collections={collections} />
    </section>
  );
}
