import { notFound } from "next/navigation";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePost, savePost } from "../actions";
import { PostForm } from "../post-form";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <>
      <EditorHeader title={post.title} saved={Boolean(saved)} viewHref={post.publishedAt ? `/blog/${post.slug}` : undefined} onDelete={deletePost.bind(null, post.id)} />
      <PostForm
        action={savePost.bind(null, post.id)}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body,
          coverImage: post.coverImage ?? "",
          author: post.author,
          published: Boolean(post.publishedAt),
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </>
  );
}
