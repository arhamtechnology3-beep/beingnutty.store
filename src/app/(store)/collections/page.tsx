import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { buildSafe } from "@/lib/build-safe";
import { db } from "@/lib/db";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop by collection — Dry Fruits, Smoked Nuts & Mixes",
  description: "Browse Being Nutty collections: raw kaju, badam and pista, smoked nuts and dry fruit mixes — all packed in cans and delivered across India.",
  alternates: { canonical: "/collections" },
};

const TONES = ["#e9c987", "#c8945a", "#9db24e", "#d08a3c", "#5a2618"];

export default async function CollectionsIndexPage() {
  const collections = await buildSafe(
    () =>
      db.collection.findMany({
        where: { published: true },
        orderBy: { position: "asc" },
        include: { _count: { select: { products: { where: { product: { status: "ACTIVE" } } } } } },
      }),
    [],
  );

  return (
    <>
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: "Collections",
          url: absoluteUrl("/collections"),
          hasPart: collections.map((c) => ({ "@type": "CollectionPage", name: c.title, url: absoluteUrl(`/collections/${c.slug}`) })),
        }}
      />
      <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
          ]}
        />
        <h1 className="mt-6 font-display text-6xl font-black leading-[0.9] tracking-tight md:text-8xl">Collections</h1>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const bg = TONES[i % TONES.length];
            return (
              <li key={c.id}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="grain group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[2rem] p-8 transition-transform duration-500 hover:-translate-y-1"
                  style={{ background: bg, color: c.image || i % TONES.length === 4 ? "var(--paper)" : "var(--ink)" }}
                >
                  {c.image ? (
                    <>
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    </>
                  ) : null}
                  <ArrowUpRight className="absolute right-6 top-6 z-10 size-7 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                  <h2 className="relative font-display text-4xl font-black leading-none">{c.title}</h2>
                  <p className="relative mt-2 text-sm font-semibold opacity-75">
                    {c._count.products} product{c._count.products === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
