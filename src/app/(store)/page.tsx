import type { Metadata } from "next";
import { ClosingCta } from "@/components/home/closing-cta";
import { CollectionsGrid } from "@/components/home/collections-grid";
import { FreshPour } from "@/components/home/fresh-pour";
import { Hero, type HeroCan } from "@/components/home/hero";
import { IntroLoader } from "@/components/home/intro-loader";
import { Marquee } from "@/components/home/marquee";
import { NutStory } from "@/components/home/nut-story";
import { ProductShowcase } from "@/components/home/product-showcase";
import { RawVsRoasted } from "@/components/home/raw-vs-roasted";
import { WhyStack } from "@/components/home/why-stack";
import { KeywordMarquee } from "@/components/home/keyword-marquee";
import { FaqList } from "@/components/store/faq-list";
import { cutoutFor, type CanPhotoSlug } from "@/components/visuals/can-photo";
import { getActiveProducts, getCollections, shortTitle, toCardProduct } from "@/lib/catalog";
import { storeFaqs } from "@/lib/faq-builder";
import { getShippingSettings } from "@/lib/orders";
import { faqLd, JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { "en-IN": "/" } },
};

export const revalidate = 300;

export default async function HomePage() {
  const [active, shipping, collections] = await Promise.all([
    getActiveProducts(),
    getShippingSettings(),
    getCollections(),
  ]);
  const products = active.map(toCardProduct);
  const faqs = storeFaqs(shipping);
  const heroCans: HeroCan[] = products
    .filter((p) => cutoutFor(p.slug) && p.variants.length)
    .map((p) => ({
      slug: p.slug as CanPhotoSlug,
      name: p.title.split("—")[0].trim(),
      accentColor: p.accentColor,
      from: Math.min(...p.variants.map((v) => v.price)),
    }));
  const homeCollections = collections.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    image: c.image,
    featured: c.featured,
    productCount: "_count" in c && c._count ? c._count.products : 0,
    productNames:
      "products" in c && Array.isArray(c.products)
        ? c.products.map((pc: { product: { title: string } }) => shortTitle(pc.product.title))
        : [],
  }));

  return (
    <>
      <JsonLd
        data={[
          faqLd(faqs),
          {
            "@type": "ItemList",
            name: "Being Nutty dry fruits",
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/products/${p.slug}`),
              name: p.title,
            })),
          },
          {
            "@type": "ItemList",
            name: "Being Nutty collections",
            itemListElement: homeCollections.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/collections/${c.slug}`),
              name: c.title,
            })),
          },
        ]}
      />
      <IntroLoader />
      <Hero cans={heroCans} />
      <ProductShowcase products={products} />
      <Marquee />
      <NutStory />
      <CollectionsGrid collections={homeCollections} />
      <RawVsRoasted />
      <FreshPour />
      <div className="pt-28 md:pt-36">
        <WhyStack />
      </div>

      <section aria-labelledby="faq-title" className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-20 md:grid-cols-[1fr_2fr] md:px-10 md:pb-28">
        <div>
          <h2 id="faq-title" className="font-display text-5xl font-black leading-[0.9] tracking-tight md:text-6xl">
            Questions, <span className="italic text-caramel">answered.</span>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-roast">
            Being Nutty is an Indian dry fruit brand selling kaju, badam, pista, smoked nuts and dry fruit mixes —
            all packed in cans and delivered across India.
          </p>
        </div>
        <FaqList faqs={faqs} />
      </section>

      <KeywordMarquee
        collections={homeCollections.map((c) => ({ title: c.title, slug: c.slug }))}
        products={products.map((p) => ({ title: p.title, slug: p.slug }))}
      />

      <ClosingCta />
    </>
  );
}
