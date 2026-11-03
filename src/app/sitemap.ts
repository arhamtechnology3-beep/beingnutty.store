import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const toAbsolute = (url: string) => (url.startsWith("/") ? absoluteUrl(url) : url);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pages, posts] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true, images: { select: { url: true }, orderBy: { position: "asc" } } },
    }),
    db.collection.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, image: true } }),
    db.page.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1, images: [absoluteUrl("/images/lifestyle/range-trio.jpg")] },
    { url: absoluteUrl("/collections"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/track-order"), changeFrequency: "yearly", priority: 0.2 },
    ...collections.map((c) => ({
      url: absoluteUrl(`/collections/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(c.image ? { images: [toAbsolute(c.image)] } : {}),
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: p.images.map((i) => toAbsolute(i.url)),
    })),
    ...pages.map((p) => ({ url: absoluteUrl(`/pages/${p.slug}`), lastModified: p.updatedAt, priority: 0.3 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 })),
  ];
}
