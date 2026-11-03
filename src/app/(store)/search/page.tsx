import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getActiveProducts, searchProducts, toCardProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const SUGGESTIONS = ["Kaju", "Badam", "Pista", "Smoked", "3 Mix", "Raw"];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";

  const products = query ? await searchProducts(query) : [];
  const fallback = query && !products.length ? (await getActiveProducts()).slice(0, 4) : [];

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <h1 className="font-display text-5xl font-black tracking-tight md:text-7xl">Search</h1>
      <form action="/search" className="mt-8 flex max-w-xl gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Try kaju, smoked, pista…"
          className="min-w-0 flex-1 rounded-full border-2 border-line bg-paper px-5 py-3 focus:border-ink focus:outline-none"
        />
        <button className="rounded-full bg-ink px-6 py-3 font-semibold text-paper">Search</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Link
            key={s}
            href={`/search?q=${encodeURIComponent(s)}`}
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium transition-colors hover:border-ink"
          >
            {s}
          </Link>
        ))}
      </div>

      {query ? (
        <p className="mt-10 text-roast" aria-live="polite">
          {products.length} result{products.length === 1 ? "" : "s"} for “{query}”
        </p>
      ) : null}
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={toCardProduct(p)} />
          </li>
        ))}
      </ul>

      {fallback.length ? (
        <section className="mt-4" aria-labelledby="no-results">
          <h2 id="no-results" className="font-display text-3xl font-black tracking-tight">
            Nothing matched — try one of these
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {fallback.map((p) => (
              <li key={p.id}>
                <ProductCard product={toCardProduct(p)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
