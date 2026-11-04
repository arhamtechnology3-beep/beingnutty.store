import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { KwikPassCollectionView } from "@/components/kwikpass/kwikpass-collection-view";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { FaqSection } from "@/components/store/faq-section";
import { ProductGrid } from "@/components/store/product-grid";
import { buildSafe } from "@/lib/build-safe";
import {
  getCollectionBySlug,
  getCollections,
  toCardProduct,
} from "@/lib/catalog";
import { collectionFaqs, orderFaqs } from "@/lib/faq-builder";
import { getShippingSettings } from "@/lib/orders";
import { faqLd, JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { redirectOrNotFound } from "@/lib/redirects";

export const revalidate = 300;

export async function generateStaticParams() {
  const collections = await buildSafe(() => getCollections(), []);
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  const description =
    collection.seoDescription ?? collection.description ?? undefined;
  return {
    title: collection.seoTitle ?? `${collection.title} — Buy Online in India`,
    description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      url: `/collections/${collection.slug}`,
      title: collection.title,
      description,
      ...(collection.image && {
        images: [{ url: collection.image, alt: collection.title }],
      }),
    },
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const [collection, collections, shipping] = await Promise.all([
    getCollectionBySlug(slug),
    getCollections(),
    getShippingSettings(),
  ]);
  if (!collection) return redirectOrNotFound(`/collections/${slug}`);

  const products = collection.products.map((pc) => toCardProduct(pc.product));
  const faqs = collectionFaqs(
    collection.title,
    collection.products.map((pc) => pc.product),
  );
  const ordering = orderFaqs(shipping);

  return (
    <>
      <KwikPassCollectionView
        collectionId={collection.id}
        name={collection.title}
        imageUrl={collection.image}
        handle={collection.slug}
      />
      <JsonLd
        data={[
          faqLd([...faqs, ...ordering]),
          {
            "@type": "CollectionPage",
            name: collection.title,
            description: collection.description,
            url: absoluteUrl(`/collections/${collection.slug}`),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(`/products/${p.slug}`),
                name: p.title,
              })),
            },
          },
        ]}
      />
      <section className="grain bg-paper pb-16 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              {
                name: collection.title,
                path: `/collections/${collection.slug}`,
              },
            ]}
          />
          <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl md:text-8xl">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="mt-6 max-w-2xl text-xl text-roast">
              {collection.description}
            </p>
          ) : null}
          <nav aria-label="Collections" className="mt-10 flex flex-wrap gap-2">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                aria-current={c.slug === collection.slug ? "page" : undefined}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
              >
                {c.title}
              </Link>
            ))}
          </nav>
          {collection.image ? (
            <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-[2.5rem] md:aspect-[21/9]">
              <Image
                src={collection.image}
                alt={`${collection.title} from Being Nutty`}
                fill
                preload
                sizes="(min-width: 1400px) 1320px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <ProductGrid products={products} />
        <div className="mt-24 md:mt-32">
          <FaqSection
            id="collection-faq"
            title={`${collection.title} FAQs`}
            faqs={faqs}
            ordering={ordering}
          />
        </div>
      </div>
    </>
  );
}
