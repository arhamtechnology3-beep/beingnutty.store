import type { Metadata } from "next";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { KwikPassProductView } from "@/components/kwikpass/kwikpass-product-view";
import { APlus, type RangeRow } from "@/components/store/aplus";
import { BoughtTogether } from "@/components/store/bought-together";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { BuyBox, BuyBoxFromUrl } from "@/components/store/buy-box";
import { FaqSection } from "@/components/store/faq-section";
import { orderFaqs, productFaqs } from "@/lib/faq-builder";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { DeliveryEstimate } from "@/components/store/delivery-estimate";
import { RecentlyViewed } from "@/components/store/recently-viewed";
import { ProductReviews, Stars } from "@/components/store/reviews";
import { TrustBadges } from "@/components/store/trust-badges";
import { Can } from "@/components/visuals/can";
import { APLUS, aplusFacts } from "@/lib/aplus";
import { buildSafe } from "@/lib/build-safe";
import { getActiveProducts, getProductBySlug, shortTitle, toCardProduct, toMiniProduct } from "@/lib/catalog";
import { recommend } from "@/lib/recommend";
import { cartMilestones } from "@/lib/rewards";
import { getShippingSettings } from "@/lib/orders";
import { faqLd, JsonLd, productLd, productOgImage } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";
import { imagesForVariant } from "@/lib/variant-images";
import { redirectOrNotFound } from "@/lib/redirects";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const from = Math.min(...product.variants.map((v) => v.price));
  const description =
    product.seoDescription ??
    `${product.shortDescription ?? product.title} Buy ${product.title} online from Being Nutty from ${formatINR(from)}. Packed in cans, delivered across India.`;
  const inStock = product.variants.some((v) => !v.trackInventory || v.inventoryQty > 0);
  return {
    title: product.seoTitle ?? `${product.title} — Buy Online`,
    description,
    other: {
      "product:brand": site.name,
      "product:price:amount": (from / 100).toFixed(2),
      "product:price:currency": site.currency,
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
    },
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${product.slug}`,
      title: product.title,
      description,
      images: [
        product.images[0]
          ? { url: product.images[0].url, alt: product.images[0].alt }
          : { url: productOgImage(product.slug), width: 1200, height: 630, alt: product.title },
      ],
    },
  };
}

type Faq = { q: string; a: string };

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await buildSafe(() => getActiveProducts(), []);
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return redirectOrNotFound(`/products/${slug}`);

  const card = toCardProduct(product);
  const faqs = (Array.isArray(product.faqs) ? product.faqs : []) as Faq[];
  const primaryCollection = product.collections.find((c) => c.collection.slug !== "dry-fruits")?.collection;
  const [allProducts, shipping] = await Promise.all([getActiveProducts(), getShippingSettings()]);
  const related = allProducts
    .filter((p) => p.id !== product.id && p.tags.some((t) => product.tags.includes(t)))
    .slice(0, 4)
    .map(toCardProduct);

  const minis = allProducts.map(toMiniProduct);
  const self = minis.find((m) => m.slug === product.slug);
  const bundle = self ? [self, ...recommend(minis, [product.slug], 2)] : [];

  const name = shortTitle(product.title);
  const sizeList = product.variants.map((v) => (v.packaging ? `${v.title} (${v.packaging})` : v.title)).join(", ");
  const aplus = APLUS[product.slug];
  const facts = aplus
    ? aplusFacts(name, aplus, { ingredients: product.ingredients, sizes: sizeList, origin: product.origin })
    : [];
  const range: RangeRow[] = allProducts.flatMap((p) => {
    const a = APLUS[p.slug];
    if (!a) return [];
    return [
      {
        slug: p.slug,
        title: shortTitle(p.title),
        image: p.images[0]?.url ?? null,
        kind: a.kind,
        taste: a.taste,
        bestFor: a.bestFor,
        sizes: p.variants.map((v) => v.title).join(" · "),
        from: Math.min(...p.variants.map((v) => v.price)),
      },
    ];
  });
  const coveredByFaqs = (key: string) =>
    (key === "sizes" && faqs.some((f) => /size/i.test(f.q))) || (key === "storage" && faqs.some((f) => /store/i.test(f.q)));
  const extraFaqs = productFaqs(name, product).filter((f) => !faqs.some((x) => x.q === f.q));
  const moreFaqs = [...faqs, ...extraFaqs];
  const orderingFaqs = orderFaqs(shipping);
  const answerFaqs = [...facts.filter((f) => !coveredByFaqs(f.key)), ...moreFaqs, ...orderingFaqs];

  const rating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;
  const first = card.variants[0];

  const variantImages = Object.fromEntries(
    product.variants.flatMap((v) => {
      const img = imagesForVariant(product.images, v.id)[0];
      return img ? [[v.id, img.url]] : [];
    }),
  );

  const variants = product.variants.map((v, i) => ({ ...card.variants[i], packaging: v.packaging }));
  const specs = [
    { label: "Category", value: product.category },
    { label: "Sizes", value: product.variants.map((v) => v.title).join(", ") },
    { label: "Packaging", value: [...new Set(product.variants.map((v) => v.packaging).filter(Boolean))].join(", ") },
    { label: "Ingredients", value: product.ingredients },
    { label: "Shelf life", value: product.shelfLife },
    { label: "Storage", value: product.storage },
    { label: "Origin", value: product.origin },
    { label: "Manufactured by", value: site.manufacturer },
    { label: "FSSAI Lic. No.", value: site.fssaiLicence },
  ].filter((s) => s.value);

  return (
    <>
      <KwikPassProductView
        productId={product.id}
        variantId={product.variants[0]?.id}
        imageUrl={product.images[0]?.url ?? null}
        name={product.title}
        price={Math.min(...product.variants.map((v) => v.price))}
        handle={product.slug}
      />
      <JsonLd data={[productLd(product, shipping), ...(answerFaqs.length ? [faqLd(answerFaqs)] : [])]} />
      <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            ...(primaryCollection ? [{ name: primaryCollection.title, path: `/collections/${primaryCollection.slug}` }] : []),
            { name: product.title, path: `/products/${product.slug}` },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.images.length ? (
              <ProductGallery
                slug={product.slug}
                images={product.images}
                variants={product.variants.map((v) => ({ id: v.id, title: v.title, packaging: v.packaging }))}
                defaultVariantId={product.variants[0].id}
                accentColor={card.accentColor}
              />
            ) : (
              <div
                className="grain relative grid aspect-square place-items-center overflow-hidden rounded-[2.5rem]"
                style={{ background: `color-mix(in oklab, ${card.accentColor} 40%, var(--paper))` }}
              >
                <div className="w-[46%]">
                  <Can label={shortTitle(product.title)} sublabel={product.variants[0]?.packaging ?? undefined} color={card.accentColor} />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-roast">{product.vendor}</p>
            <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">{product.title}</h1>
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm text-roast hover:text-ink">
              {product.reviews.length ? (
                <>
                  <Stars rating={rating} />
                  <span>
                    <strong className="text-ink">{rating.toFixed(1)}</strong> · {product.reviews.length} review
                    {product.reviews.length === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span className="underline underline-offset-4">Be the first to review</span>
              )}
            </a>
            {product.shortDescription ? <p className="mt-5 text-xl text-roast">{product.shortDescription}</p> : null}

            <div className="mt-8">
              <Suspense fallback={<BuyBox product={card} variants={variants} variantImages={variantImages} />}>
                <BuyBoxFromUrl product={card} variants={variants} variantImages={variantImages} />
              </Suspense>
            </div>

            <div className="mt-6 grid gap-3">
              <DeliveryEstimate freeAbove={formatINR(shipping.freeAbove)} />
              <TrustBadges codEnabled={shipping.codEnabled} />
            </div>

            {product.highlights.length ? (
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
                    <Check className="size-5 shrink-0 text-pista" aria-hidden />
                    <span className="font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {product.description ? (
              <section className="mt-12" aria-labelledby="about-product">
                <h2 id="about-product" className="font-display text-2xl font-bold">
                  About {shortTitle(product.title)}
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-roast">{product.description}</p>
              </section>
            ) : null}

            <section className="mt-10" aria-labelledby="specs">
              <h2 id="specs" className="font-display text-2xl font-bold">
                Product details
              </h2>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[140px_1fr] gap-4 py-3">
                    <dt className="text-roast">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        <BoughtTogether items={bundle} milestones={cartMilestones(shipping.freeAbove, shipping.rewards)} />

        {aplus ? (
          <APlus
            name={name}
            content={aplus}
            facts={facts}
            accentColor={card.accentColor}
            range={range}
            currentSlug={product.slug}
          />
        ) : null}

        <div className="mt-24">
          <FaqSection id="product-faq" title={`${name} FAQs`} faqs={moreFaqs} ordering={orderingFaqs} />
        </div>

        <ProductReviews productId={product.id} productName={shortTitle(product.title)} reviews={product.reviews} />

        {related.length ? (
          <section className="mt-24" aria-labelledby="related">
            <h2 id="related" className="font-display text-4xl font-black tracking-tight">
              You might also like
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <RecentlyViewed
          track={{
            slug: product.slug,
            title: product.title,
            image: card.image?.url ?? null,
            price: first.price,
            compareAtPrice: first.compareAtPrice,
            accentColor: card.accentColor,
            variantId: first.id,
            variantTitle: first.title,
          }}
        />
      </div>
    </>
  );
}
