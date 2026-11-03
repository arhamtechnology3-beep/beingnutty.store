import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { savePost } from "../actions";
import { PostForm } from "../post-form";

export const metadata = { title: "Write post" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Write post" />
      <PostForm
        action={savePost.bind(null, null)}
        initial={{ title: "", slug: "", excerpt: "", body: "", coverImage: "", author: "Being Nutty", published: false, seoTitle: "", seoDescription: "" }}
      />
    </>
  );
}
