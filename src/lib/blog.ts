import "server-only";
import { cache } from "react";
import { buildSafe } from "./build-safe";
import { db } from "./db";

const published = () => ({ publishedAt: { not: null, lte: new Date() } });

export const getPublishedPosts = cache(async () =>
  buildSafe(() => db.blogPost.findMany({ where: published(), orderBy: { publishedAt: "desc" } }), []),
);

export const getPostBySlug = cache(async (slug: string) => db.blogPost.findFirst({ where: { slug, ...published() } }));

/** Rough reading time for article cards. */
export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).length / 200));
}
