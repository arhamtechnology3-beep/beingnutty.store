import type { Metadata } from "next";
import { cache } from "react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ContactForm } from "@/components/store/contact-form";
import { RichText } from "@/components/store/rich-text";
import { db } from "@/lib/db";
import { redirectOrNotFound } from "@/lib/redirects";

export const revalidate = 300;

const getPage = cache((slug: string) => db.page.findFirst({ where: { slug, published: true } }));

export async function generateStaticParams() {
  const pages = await db.page.findMany({ where: { published: true }, select: { slug: true } });
  return pages;
}

export async function generateMetadata({ params }: PageProps<"/pages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.body.slice(0, 155),
    alternates: { canonical: `/pages/${page.slug}` },
  };
}

export default async function ContentPage({ params }: PageProps<"/pages/[slug]">) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return redirectOrNotFound(`/pages/${slug}`);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-28 pt-32 md:pt-40">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: page.title, path: `/pages/${page.slug}` },
        ]}
      />
      <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">{page.title}</h1>
      <p className="mt-3 text-sm text-roast">Last updated {page.updatedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
      <div className="mt-10">
        <RichText text={page.body} />
      </div>
      {page.slug === "contact" ? <ContactForm /> : null}
    </article>
  );
}
