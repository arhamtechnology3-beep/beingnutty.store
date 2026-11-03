import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { getPublishedPosts, readingMinutes } from "@/lib/blog";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Nutty Journal — Dry Fruit Guides, Recipes & Tips",
  description: "Guides on choosing, storing and enjoying kaju, badam, pista and nut mixes, plus easy recipes from the Being Nutty kitchen.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <JsonLd
        data={{
          "@type": "Blog",
          name: `${site.name} Journal`,
          url: absoluteUrl("/blog"),
          publisher: { "@id": absoluteUrl("/#organization") },
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(`/blog/${p.slug}`),
            datePublished: p.publishedAt?.toISOString(),
          })),
        }}
      />
      <div className="mx-auto max-w-[1200px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
          ]}
        />
        <h1 className="mt-6 font-display text-6xl font-black leading-[0.9] tracking-tight md:text-8xl">The Nutty Journal</h1>
        <p className="mt-6 max-w-2xl text-xl text-roast">Guides, recipes and everything worth knowing about dry fruits.</p>

        {posts.length === 0 ? (
          <p className="mt-16 rounded-[2rem] bg-paper p-10 text-center text-roast">New stories are on their way. Check back soon.</p>
        ) : (
          <ul className="mt-16 grid gap-10 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="grain relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-caramel/40">
                    {p.coverImage ? (
                      <Image src={p.coverImage} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center p-8 text-center font-display text-4xl font-black text-ink/80">
                        {p.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-sm text-roast">
                    {p.publishedAt?.toLocaleDateString("en-IN", { dateStyle: "long" })} · {readingMinutes(p.body)} min read
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold leading-tight group-hover:underline">{p.title}</h2>
                  {p.excerpt ? <p className="mt-3 text-lg text-roast">{p.excerpt}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
