import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { RichText } from "@/components/store/rich-text";
import { getPostBySlug, getPublishedPosts, readingMinutes } from "@/lib/blog";
import { buildSafe } from "@/lib/build-safe";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { redirectOrNotFound } from "@/lib/redirects";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await buildSafe(() => getPublishedPosts(), []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const description = post.seoDescription ?? post.excerpt ?? post.body.slice(0, 155);
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return redirectOrNotFound(`/blog/${slug}`);
  const more = (await getPublishedPosts()).filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          url: absoluteUrl(`/blog/${post.slug}`),
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: { "@type": "Organization", name: post.author },
          publisher: { "@id": absoluteUrl("/#organization") },
          ...(post.coverImage ? { image: [post.coverImage] } : {}),
          wordCount: post.body.split(/\s+/).length,
        }}
      />
      <article className="mx-auto max-w-3xl px-5 pb-20 pt-32 md:pt-40">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />
        <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">{post.title}</h1>
        <p className="mt-4 text-sm text-roast">
          By {post.author} · <time dateTime={post.publishedAt?.toISOString()}>{post.publishedAt?.toLocaleDateString("en-IN", { dateStyle: "long" })}</time> ·{" "}
          {readingMinutes(post.body)} min read
        </p>
        {post.excerpt ? <p className="mt-8 text-xl leading-relaxed text-roast">{post.excerpt}</p> : null}
        {post.coverImage ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem]">
            <Image src={post.coverImage} alt="" fill preload sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="mt-10">
          <RichText text={post.body} />
        </div>
        <div className="mt-14 rounded-[2rem] bg-caramel p-8 text-ink">
          <p className="font-display text-3xl font-black">Ready to go a little nutty?</p>
          <Link href="/collections/dry-fruits" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-paper">
            Shop dry fruits
          </Link>
        </div>
      </article>

      {more.length ? (
        <section aria-labelledby="more-title" className="mx-auto max-w-3xl px-5 pb-28">
          <h2 id="more-title" className="font-display text-3xl font-bold">
            More from the journal
          </h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {more.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="block py-5 text-xl font-semibold hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
