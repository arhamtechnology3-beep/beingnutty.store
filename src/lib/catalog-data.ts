// Source of truth for the initial catalog (from the Being Nutty product sheet).
// Prices are PLACEHOLDERS in paise — update them in /admin/products.

export type SeedVariant = {
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  weightGrams?: number;
  packaging: string;
};

export type SeedFaq = { q: string; a: string };

export type SeedImage = { url: string; alt: string };

export type SeedProduct = {
  slug: string;
  title: string;
  category: string;
  collections: string[];
  accentColor: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  tags: string[];
  faqs: SeedFaq[];
  variants: SeedVariant[];
  ingredients?: string;
  origin?: string;
  images?: SeedImage[];
};

export type SeedCollection = {
  slug: string;
  title: string;
  description: string;
  image?: string;
};

type PhotoKind = "front" | "tall-can" | "poured" | "styled" | "close-up" | "label";

const PHOTO_ALT: Record<PhotoKind, (name: string) => string> = {
  front: (n) => `Being Nutty ${n} in a clear can with the Being Nutty label`,
  "tall-can": (n) => `Being Nutty ${n} in the tall can`,
  poured: (n) => `Being Nutty ${n} poured out beside the can`,
  styled: (n) => `Being Nutty ${n} served in a bowl next to the can`,
  "close-up": (n) => `Close-up of Being Nutty ${n}`,
  label: (n) => `Label and ingredients panel on the Being Nutty ${n} can`,
};

function photos(slug: string, name: string, kinds: PhotoKind[]): SeedImage[] {
  return kinds.map((kind) => ({
    url: `/images/products/${slug}/${kind}.jpg`,
    alt: PHOTO_ALT[kind](name),
  }));
}

const FULL_SET: PhotoKind[] = ["front", "tall-can", "poured", "styled", "close-up", "label"];
const SHORT_SET: PhotoKind[] = ["front", "tall-can", "styled", "label"];

export const SEED_COLLECTIONS: SeedCollection[] = [
  {
    slug: "dry-fruits",
    title: "All Dry Fruits",
    description:
      "The complete Being Nutty range — whole cashews, almonds, pistachios, smoked nuts and dry fruit mixes, packed in cans.",
    image: "/images/lifestyle/range-tall.jpg",
  },
  {
    slug: "raw-nuts",
    title: "Raw Nuts",
    description:
      "Whole kaju, badam and pista, packed as they are — for snacking, cooking, sweets and soaking overnight.",
    image: "/images/lifestyle/range-trio-bowls.jpg",
  },
  {
    slug: "roasted-nuts",
    title: "Smoked Nuts",
    description:
      "Smoked kaju, badam, pista and mix — roasted with a pinch of iodised salt and a touch of olive oil for a smoky, ready-to-eat crunch.",
    image: "/images/lifestyle/smoked-trio.jpg",
  },
  {
    slug: "mixes",
    title: "Dry Fruit Mixes",
    description: "Ready-to-snack blends of cashews, almonds and pistachios, raw or smoked.",
    image: "/images/lifestyle/mix-styled.jpg",
  },
];

const CAN_500 = "500 ml can";
const CAN_750 = "750 ml tall can";

const storageFaq: SeedFaq = {
  q: "How should I store it after opening?",
  a: "Close the can lid tightly after every use and keep it in a cool, dry place away from direct sunlight. For longer freshness in humid weather, you can refrigerate it.",
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "kaju-cashews",
    title: "Kaju — Whole Cashews",
    category: "Dryfruit",
    collections: ["dry-fruits", "raw-nuts"],
    accentColor: "#E9C987",
    shortDescription: "Whole, creamy cashews packed in a can.",
    description:
      "Being Nutty Kaju are whole cashews with a naturally creamy, buttery bite. Snack on them straight from the can, add them to curries and pulao, or use them in sweets and smoothies.",
    highlights: ["Whole cashews", "Packed in a can", "Snack, cook or bake"],
    tags: ["cashew", "kaju", "raw"],
    faqs: [
      {
        q: "What sizes are Being Nutty Kaju available in?",
        a: "Kaju comes in a 250 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "250g", sku: "BN-KAJU-250", price: 34900, weightGrams: 250, packaging: CAN_500 },
      { title: "400g", sku: "BN-KAJU-400", price: 54900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Premium whole cashews",
    images: photos("kaju-cashews", "Kaju whole cashews", FULL_SET),
  },
  {
    slug: "badam-almonds",
    title: "Badam — Whole Almonds",
    category: "Dryfruit",
    collections: ["dry-fruits", "raw-nuts"],
    accentColor: "#B9773F",
    shortDescription: "Whole almonds for everyday snacking and soaking.",
    description:
      "Being Nutty Badam are whole almonds for your daily handful. Eat them as they are, soak them overnight, or add them to milk, desserts and breakfast bowls.",
    highlights: ["Whole almonds", "Great for soaking", "Packed in a can"],
    tags: ["almond", "badam", "raw"],
    faqs: [
      {
        q: "What sizes are Being Nutty Badam available in?",
        a: "Badam comes in a 250 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "250g", sku: "BN-BADAM-250", price: 32900, weightGrams: 250, packaging: CAN_500 },
      { title: "400g", sku: "BN-BADAM-400", price: 49900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "100% whole almonds",
    origin: "California, USA",
    images: photos("badam-almonds", "Badam California almonds", FULL_SET),
  },
  {
    slug: "pista-pistachios",
    title: "Pista — Pistachios",
    category: "Dryfruit",
    collections: ["dry-fruits", "raw-nuts"],
    accentColor: "#9DB24E",
    shortDescription: "Green, flavourful pistachios packed in a can.",
    description:
      "Being Nutty Pista are pistachios with their signature green kernel and rich flavour. Enjoy them as a snack or use them to garnish kheer, kulfi and mithai.",
    highlights: ["Rich, nutty flavour", "Snack or garnish", "Packed in a can"],
    tags: ["pistachio", "pista", "raw"],
    faqs: [
      {
        q: "What sizes are Being Nutty Pista available in?",
        a: "Pista comes in a 200 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "200g", sku: "BN-PISTA-200", price: 44900, weightGrams: 200, packaging: CAN_500 },
      { title: "400g", sku: "BN-PISTA-400", price: 84900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Pistachio kernels",
    images: photos("pista-pistachios", "Pista pistachio kernels", FULL_SET),
  },
  {
    slug: "roasted-kaju-cashews",
    title: "Smoked Kaju — Smoked Cashews",
    category: "Dryfruit",
    collections: ["dry-fruits", "roasted-nuts"],
    accentColor: "#C9964F",
    shortDescription: "Roasted, lightly salted cashews with a smoky crunch.",
    description:
      "Being Nutty Smoked Kaju are cashew kernels roasted with a pinch of iodised salt and a touch of olive oil for a smoky, savoury crunch. A ready-to-eat snack for tea time, work breaks and travel.",
    highlights: ["Smoky, salted crunch", "Ready to eat", "Packed in a can"],
    tags: ["cashew", "kaju", "smoked", "roasted"],
    faqs: [
      {
        q: "What sizes are Being Nutty Smoked Kaju available in?",
        a: "Smoked Kaju comes in a 250 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "250g", sku: "BN-RKAJU-250", price: 37900, weightGrams: 250, packaging: CAN_500 },
      { title: "400g", sku: "BN-RKAJU-400", price: 58900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Roasted cashew kernels (98.3%), iodised salt (1.2%), olive oil (0.5%)",
    images: photos("roasted-kaju-cashews", "smoked cashews", SHORT_SET),
  },
  {
    slug: "roasted-badam-almonds",
    title: "Smoked Badam — Smoked Almonds",
    category: "Dryfruit",
    collections: ["dry-fruits", "roasted-nuts"],
    accentColor: "#8E5228",
    shortDescription: "Roasted, lightly salted almonds with a smoky crunch.",
    description:
      "Being Nutty Smoked Badam are almond kernels roasted with a pinch of iodised salt and a touch of olive oil for a deeper, smoky flavour and a satisfying crunch — a smarter swap for fried snacks.",
    highlights: ["Smoky, salted crunch", "Ready to eat", "Packed in a can"],
    tags: ["almond", "badam", "smoked", "roasted"],
    faqs: [
      {
        q: "What sizes are Being Nutty Smoked Badam available in?",
        a: "Smoked Badam comes in a 250 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "250g", sku: "BN-RBADAM-250", price: 35900, weightGrams: 250, packaging: CAN_500 },
      { title: "400g", sku: "BN-RBADAM-400", price: 53900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Roasted almond kernels (98.3%), iodised salt (1.2%), olive oil (0.5%)",
    images: photos("roasted-badam-almonds", "smoked almonds", SHORT_SET),
  },
  {
    slug: "roasted-pista-pistachios",
    title: "Smoked Pista — Smoked Pistachios",
    category: "Dryfruit",
    collections: ["dry-fruits", "roasted-nuts"],
    accentColor: "#6F8A35",
    shortDescription: "Roasted, lightly salted pistachios with a bold, smoky bite.",
    description:
      "Being Nutty Smoked Pista are pistachio kernels roasted with a pinch of iodised salt and a touch of olive oil for a bolder, smoky flavour. Open a can for movie nights, gifting and snacking on the go.",
    highlights: ["Bold, smoky flavour", "Ready to eat", "Packed in a can"],
    tags: ["pistachio", "pista", "smoked", "roasted"],
    faqs: [
      {
        q: "What sizes are Being Nutty Smoked Pista available in?",
        a: "Smoked Pista comes in a 200 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "200g", sku: "BN-RPISTA-200", price: 46900, weightGrams: 200, packaging: CAN_500 },
      { title: "400g", sku: "BN-RPISTA-400", price: 87900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Roasted pistachio kernels (98.3%), iodised salt (1.2%), olive oil (0.5%)",
    images: photos("roasted-pista-pistachios", "smoked pistachios", SHORT_SET),
  },
  {
    slug: "mix-dry-fruits",
    title: "3 Mix Nuts — Mix Dry Fruit",
    category: "Dryfruit",
    collections: ["dry-fruits", "mixes"],
    accentColor: "#D0753A",
    shortDescription: "Almonds, cashews and pistachios together in one can.",
    description:
      "Being Nutty 3 Mix Nuts brings whole almonds, cashews and pistachio kernels together in one can, so every handful has a little bit of everything.",
    highlights: ["Variety in every handful", "Snack-ready", "Packed in a can"],
    tags: ["mix", "trail mix", "raw"],
    faqs: [
      {
        q: "What sizes is Being Nutty 3 Mix Nuts available in?",
        a: "3 Mix Nuts comes in a 200 g pack (500 ml can) and a 400 g pack (750 ml tall can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "200g", sku: "BN-MIX-200", price: 29900, weightGrams: 200, packaging: CAN_500 },
      { title: "400g", sku: "BN-MIX-400", price: 54900, weightGrams: 400, packaging: CAN_750 },
    ],
    ingredients: "Almonds, cashew nuts, pistachio kernels",
    images: photos("mix-dry-fruits", "3 Mix Nuts", SHORT_SET),
  },
  {
    slug: "roasted-mix-dry-fruits",
    title: "Smoked Salted 3 Mix Nuts",
    category: "Dryfruit",
    collections: ["dry-fruits", "roasted-nuts", "mixes"],
    accentColor: "#A2491F",
    shortDescription: "Smoked, lightly salted cashews, almonds and pistachios.",
    description:
      "Being Nutty Smoked Salted 3 Mix Nuts is a crunchy blend of cashew, almond and pistachio kernels, roasted with a pinch of iodised salt and a touch of olive oil — an easy, ready-to-eat snack for home, office and travel.",
    highlights: ["Smoky, salted crunch", "Variety in every handful", "Packed in a can"],
    tags: ["mix", "trail mix", "smoked", "roasted"],
    faqs: [
      {
        q: "What size is Being Nutty Smoked Salted 3 Mix Nuts available in?",
        a: "Smoked Salted 3 Mix Nuts comes in a 200 g pack (500 ml can).",
      },
      storageFaq,
    ],
    variants: [
      { title: "200g", sku: "BN-RMIX-200", price: 32900, weightGrams: 200, packaging: CAN_500 },
    ],
    ingredients:
      "Roasted cashew, pistachio and almond kernels (98.3%), iodised salt (1.2%), olive oil (0.5%)",
    images: photos("roasted-mix-dry-fruits", "smoked salted 3 Mix Nuts", SHORT_SET),
  },
];
