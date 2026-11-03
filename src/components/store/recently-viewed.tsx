"use client";

import { useEffect } from "react";
import Link from "next/link";
import { recentStore, useRecentlyViewed, type SavedProduct } from "@/lib/local-store";
import { formatINR } from "@/lib/utils";
import { ProductStage } from "./product-stage";

/** Lists recently viewed products. Pass `track` on a product page to record it (it is excluded from the list). */
export function RecentlyViewed({ track, title = "Recently viewed" }: { track?: SavedProduct; title?: string }) {
  const items = useRecentlyViewed().filter((i) => i.slug !== track?.slug);

  useEffect(() => {
    if (track) recentStore.put(track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.slug]);

  if (!items.length) return null;
  return (
    <section className="mt-24" aria-labelledby="recently-viewed">
      <h2 id="recently-viewed" className="font-display text-3xl font-black tracking-tight">
        {title}
      </h2>
      <ul className="-mx-5 mt-6 flex snap-x gap-3 overflow-x-auto px-5 pb-3 pt-1 md:mx-0 md:px-0 sm:gap-4">
        {items.slice(0, 8).map((p) => (
          <li key={p.slug} className="w-40 shrink-0 snap-start sm:w-48">
            <Link
              href={`/products/${p.slug}`}
              className="group block h-full rounded-[1.5rem] bg-paper p-1.5 ring-1 ring-line transition duration-500 ease-out-expo hover:-translate-y-1 hover:ring-ink/15"
            >
              <ProductStage
                slug={p.slug}
                label={p.title.split("—")[0].trim()}
                accentColor={p.accentColor}
                image={p.image ? { url: p.image, alt: p.title } : null}
                sizes="192px"
                className="aspect-square rounded-[1.15rem]"
              />
              <p className="mt-2.5 line-clamp-1 px-1.5 text-sm font-semibold">{p.title}</p>
              <p className="px-1.5 pb-1.5 text-sm font-bold tabular-nums text-roast">{formatINR(p.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
