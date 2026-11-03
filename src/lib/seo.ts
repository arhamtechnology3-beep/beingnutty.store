import { createElement } from "react";
import { absoluteUrl, site } from "./site";

type Ld = Record<string, unknown>;

export function JsonLd({ data }: { data: Ld | Ld[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(payload).replace(/</g, "\\u003c") },
  });
}

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: site.address.street,
  addressLocality: site.address.locality,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
};

export function organizationLd(): Ld {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    "@type": ["Organization", "OnlineStore"],
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-square.png"), width: 512, height: 512 },
    image: absoluteUrl("/images/lifestyle/range-trio.jpg"),
    description: site.description,
    slogan: site.tagline,
    email: site.email,
    telephone: site.phone,
    address: postalAddress,
    areaServed: { "@type": "Country", name: "India" },
    currenciesAccepted: site.currency,
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Wallets, Cash on Delivery",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      telephone: site.phone,
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    hasMerchantReturnPolicy: { "@id": absoluteUrl("/#return-policy") },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Food can't be returned once opened; damaged or wrong items are replaced or refunded within 48 hours. */
export function returnPolicyLd(): Ld {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": absoluteUrl("/#return-policy"),
    applicableCountry: "IN",
    returnPolicyCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 2,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
    merchantReturnLink: absoluteUrl("/pages/refund-policy"),
  };
}

export type ShippingLdInput = { flatRate: number; freeAbove: number };

function shippingDetailsLd(shipping?: ShippingLdInput, price?: number): Ld {
  const free = shipping && price !== undefined && price >= shipping.freeAbove;
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
    ...(shipping
      ? { shippingRate: { "@type": "MonetaryAmount", value: free ? 0 : shipping.flatRate / 100, currency: site.currency } }
      : {}),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: site.dispatchDays[0], maxValue: site.dispatchDays[1], unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: site.transitDays[0], maxValue: site.transitDays[1], unitCode: "DAY" },
    },
  };
}

export function websiteLd(): Ld {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: site.url,
    name: site.name,
    inLanguage: "en-IN",
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Ld {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): Ld {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const productOgImage = (slug: string) => absoluteUrl(`/og/products/${slug}`);

type ProductLdInput = {
  slug: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  category: string;
  images: { url: string }[];
  ingredients?: string | null;
  origin?: string | null;
  variants: { sku: string; title: string; price: number; inventoryQty: number; trackInventory: boolean; weightGrams: number | null }[];
  reviews?: { rating: number; name?: string; title?: string | null; body?: string; createdAt?: Date }[];
};

export function productLd(p: ProductLdInput, shipping?: ShippingLdInput): Ld {
  const url = absoluteUrl(`/products/${p.slug}`);
  const prices = p.variants.map((v) => v.price / 100);
  const image = p.images.length
    ? p.images.map((i) => (i.url.startsWith("/") ? absoluteUrl(i.url) : i.url))
    : [productOgImage(p.slug)];
  const ratings = p.reviews ?? [];
  const inStock = (v: ProductLdInput["variants"][number]) => !v.trackInventory || v.inventoryQty > 0;
  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  const properties = [
    p.ingredients && { name: "Ingredients", value: p.ingredients },
    p.origin && { name: "Origin", value: p.origin },
    { name: "FSSAI licence number", value: site.fssaiLicence },
  ].filter(Boolean) as { name: string; value: string }[];

  return {
    "@type": "ProductGroup",
    "@id": `${url}#product`,
    name: p.title,
    description: p.description ?? p.shortDescription ?? undefined,
    url,
    image,
    brand: { "@type": "Brand", name: site.name, logo: absoluteUrl("/brand/logo-square.png") },
    manufacturer: { "@type": "Organization", name: site.legalName, address: postalAddress },
    category: p.category,
    additionalProperty: properties.map((x) => ({ "@type": "PropertyValue", ...x })),
    productGroupID: p.slug,
    variesBy: ["https://schema.org/size"],
    ...(ratings.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1),
            reviewCount: ratings.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: ratings
            .filter((r) => r.name && r.body)
            .slice(0, 5)
            .map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.name },
              ...(r.createdAt ? { datePublished: r.createdAt.toISOString().slice(0, 10) } : {}),
              ...(r.title ? { name: r.title } : {}),
              reviewBody: r.body,
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            })),
        }
      : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: site.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: p.variants.length,
    },
    hasVariant: p.variants.map((v) => ({
      "@type": "Product",
      sku: v.sku,
      name: `${p.title} — ${v.title}`,
      size: v.title,
      image,
      ...(v.weightGrams ? { weight: { "@type": "QuantitativeValue", value: v.weightGrams, unitCode: "GRM" } } : {}),
      offers: {
        "@type": "Offer",
        url: `${url}?variant=${encodeURIComponent(v.sku)}`,
        price: (v.price / 100).toFixed(2),
        priceCurrency: site.currency,
        availability: inStock(v) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil,
        seller: { "@id": absoluteUrl("/#organization") },
        shippingDetails: shippingDetailsLd(shipping, v.price),
        hasMerchantReturnPolicy: { "@id": absoluteUrl("/#return-policy") },
      },
    })),
  };
}
