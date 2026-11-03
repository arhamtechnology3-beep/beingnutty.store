import { STORE_FAQS } from "./faqs";
import { grams, pricePer100g } from "./recommend";
import { activeTiers, type RewardTier } from "./rewards";
import { site } from "./site";
import { formatINR, savePercent } from "./utils";

// Answers are generated from live product data and store settings, so they stay true when prices,
// sizes or shipping rules change in the admin.

export type Faq = { q: string; a: string };
type Settings = { flatRate: number; freeAbove: number; codEnabled: boolean; rewards: RewardTier[] };
type Variant = { title: string; price: number; compareAtPrice: number | null; packaging: string | null };
type FaqProduct = { title: string; tags: string[]; ingredients: string | null; variants: Variant[] };

const NUT_NAMES: Record<string, string> = {
  kaju: "cashews",
  badam: "almonds",
  pista: "pistachios",
  mix: "cashews, almonds and pistachios",
};

const list = (items: string[]) =>
  items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const nutsIn = (p: FaqProduct) => NUT_NAMES[Object.keys(NUT_NAMES).find((n) => p.tags.includes(n)) ?? ""] ?? "tree nuts";

const isSmoked = (p: FaqProduct) => p.tags.includes("smoked");

/** Smallest vs biggest size, by price per 100 g. */
function sizeValue(variants: Variant[]) {
  const sized = variants
    .map((v) => ({ v, g: grams(v.title), per: pricePer100g(v) }))
    .filter((x): x is { v: Variant; g: number; per: number } => !!x.g && !!x.per)
    .sort((a, b) => a.g - b.g);
  if (sized.length < 2) return null;
  const small = sized[0];
  const big = sized.at(-1)!;
  const less = Math.round((1 - big.per / small.per) * 100);
  return less >= 1 ? { small, big, less } : null;
}

function valueAnswer(name: string, variants: Variant[]) {
  const value = sizeValue(variants);
  if (!value) return null;
  const { small, big, less } = value;
  const mrp = savePercent(big.v.price, big.v.compareAtPrice);
  return {
    q: `Which size of ${name} is better value?`,
    a:
      `The ${big.v.title} can. It works out to ${formatINR(big.per)} per 100 g, against ${formatINR(small.per)} per 100 g ` +
      `for the ${small.v.title} can — about ${less}% less per gram.` +
      (mrp ? ` The ${big.v.title} can is also ${mrp}% below its MRP of ${formatINR(big.v.compareAtPrice!)}.` : ""),
  };
}

/** Questions about this product that the page's "at a glance" answers don't already cover. */
export function productFaqs(name: string, p: FaqProduct): Faq[] {
  const faqs: (Faq | null)[] = [];
  const smoked = isSmoked(p);
  const nuts = nutsIn(p);
  const packs = [...new Set(p.variants.map((v) => v.packaging).filter((x): x is string => !!x))];

  faqs.push(valueAnswer(name, p.variants));
  faqs.push(
    smoked
      ? {
          q: `Is ${name} salted?`,
          a: `Yes, lightly. ${name} is roasted with a pinch of iodised salt and a touch of olive oil.${p.ingredients ? ` Ingredients: ${p.ingredients}.` : ""}`,
        }
      : {
          q: `Is ${name} roasted or salted?`,
          a: `No. ${name} is raw and unsalted${p.ingredients ? ` — the label lists only: ${p.ingredients}` : ""}. For a ready-to-eat salty crunch, try the smoked range.`,
        },
  );
  if (p.ingredients) {
    faqs.push({
      q: `Does ${name} have added sugar or preservatives?`,
      a: `No. The ingredients on the label are: ${p.ingredients}. Nothing else is added.`,
    });
  }
  faqs.push({
    q: `Is ${name} ready to eat?`,
    a: smoked
      ? `Yes. ${name} is roasted and lightly salted, so you can snack on it straight from the can.`
      : `Yes, you can eat it straight from the can. You can also soak it overnight, cook with it or use it in sweets.`,
  });
  faqs.push({
    q: `Is ${name} suitable for people with nut allergies?`,
    a: `No. ${name} contains tree nuts (${nuts}). Please avoid it if you are allergic to tree nuts.`,
  });
  if (packs.length) {
    faqs.push({
      q: `What kind of can is ${name} packed in?`,
      a: `A clear ${list(packs)} with a foil seal under the lid. Peel the seal once, then the lid snaps back on to keep the nuts fresh and crunchy.`,
    });
  }
  faqs.push({
    q: `Who makes Being Nutty ${name}?`,
    a: `Being Nutty is manufactured and marketed by ${site.manufacturer} (FSSAI Lic. No. ${site.fssaiLicence}).`,
  });
  return faqs.filter((f): f is Faq => !!f);
}

/** Shipping, delivery, payment, rewards and returns — the same everywhere, from the store settings. */
export function orderFaqs(s: Settings, { payments = true } = {}): Faq[] {
  const tiers = activeTiers(s.rewards);
  return [
    {
      q: "How much is shipping?",
      a: s.freeAbove
        ? `Shipping is free on orders of ${formatINR(s.freeAbove)} or more. Below that, a flat ${formatINR(s.flatRate)} is added at checkout.`
        : `A flat ${formatINR(s.flatRate)} shipping charge is added at checkout.`,
    },
    {
      q: "How long does delivery take?",
      a: `Orders are dispatched within ${site.dispatchDays.join("–")} working days and most arrive within ${site.transitDays.join("–")} working days after that, depending on your pincode. The product page shows an estimated delivery date.`,
    },
    ...(payments
      ? [
          {
            q: "Is cash on delivery available?",
            a: s.codEnabled
              ? "Yes, cash on delivery is available on eligible orders. You can also pay online with UPI, cards, net banking or wallets through Razorpay."
              : "Right now we accept online payments only — UPI, cards, net banking and wallets through Razorpay.",
          },
        ]
      : []),
    ...(tiers.length
      ? [
          {
            q: "Do I get a discount on bigger orders?",
            a: `Yes. ${list(tiers.map((t) => `${t.percent}% off on orders of ${formatINR(t.at)} or more`))} — applied automatically in your cart. It doesn't stack with discount codes; you get whichever saves you more.`,
          },
        ]
      : []),
    {
      q: "What if my can arrives damaged or I get the wrong item?",
      a: "Contact us within 48 hours of delivery with photos and your order number, and we will send a replacement or refund you. As these are food items, opened cans can't be returned.",
    },
  ];
}

/** Questions for a collection page, built from the products in it. */
export function collectionFaqs(title: string, products: FaqProduct[]): Faq[] {
  if (!products.length) return [];
  const faqs: Faq[] = [];
  const name = (p: FaqProduct) => p.title.split("—")[0].trim();
  const from = (p: FaqProduct) => Math.min(...p.variants.map((v) => v.price));

  faqs.push({
    q: `What's in the ${title} collection?`,
    a: `${list(products.map((p) => `${name(p)} (${p.variants.map((v) => v.title).join(" / ")}, from ${formatINR(from(p))})`))}.`,
  });

  const kinds = new Set(products.map(isSmoked));
  if (kinds.size > 1 || products.some(isSmoked)) {
    faqs.push({
      q: "What is the difference between raw and smoked nuts?",
      a: "Raw nuts are whole and unsalted — ideal for cooking, soaking and sweets. Smoked nuts are roasted with a pinch of iodised salt and a touch of olive oil, and are ready to eat straight from the can.",
    });
  }

  const cheapest = [...products].sort((a, b) => from(a) - from(b))[0];
  faqs.push({
    q: `Which is the most affordable pick in ${title}?`,
    a: `${name(cheapest)}, starting at ${formatINR(from(cheapest))} for the ${cheapest.variants.find((v) => v.price === from(cheapest))?.title} can.`,
  });

  const example = products.map((p) => ({ p, value: sizeValue(p.variants) })).find((x) => x.value);
  if (example?.value) {
    const { small, big, less } = example.value;
    faqs.push({
      q: "Are the bigger cans better value?",
      a: `Yes — bigger cans cost less per gram. For example, ${name(example.p)} ${big.v.title} works out to ${formatINR(big.per)} per 100 g against ${formatINR(small.per)} for ${small.v.title}, about ${less}% less.`,
    });
  }

  faqs.push({
    q: "Are these good for gifting?",
    a: "Yes. Every product comes in a clear, sealed can that looks neat on a table, so a few cans make an easy gift for festivals, guests or the office.",
  });
  return faqs;
}

/** Store-wide questions plus the ordering ones, for the home and FAQ pages. */
export function storeFaqs(s: Settings): Faq[] {
  return [...STORE_FAQS, ...orderFaqs(s, { payments: false })];
}
