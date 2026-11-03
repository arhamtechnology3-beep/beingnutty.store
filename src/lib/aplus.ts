// A+ (enhanced brand) content for product detail pages.
// Copy sticks to what is on the label — no health or nutrition claims without lab data.

export type APlusUse =
  | "snack"
  | "soak"
  | "cook"
  | "sweets"
  | "garnish"
  | "bake"
  | "breakfast"
  | "milk"
  | "gift"
  | "travel"
  | "party"
  | "work";

type Img = { src: string; alt: string };

export type APlusContent = {
  kind: "Raw" | "Smoked" | "Mix" | "Smoked mix";
  headline: string;
  intro: string;
  hero: Img;
  taste: string;
  bestFor: string;
  features: { title: string; text: string; image: Img }[];
  uses: { use: APlusUse; title: string; text: string }[];
};

const p = (slug: string, kind: string, alt: string): Img => ({ src: `/images/products/${slug}/${kind}.jpg`, alt });
const l = (name: string, alt: string): Img => ({ src: `/images/lifestyle/${name}.jpg`, alt });

const SMOKED_RECIPE = "roasted with 1.2% iodised salt and 0.5% olive oil — that's the whole recipe";

export const APLUS: Record<string, APlusContent> = {
  "kaju-cashews": {
    kind: "Raw",
    headline: "Whole cashews. Creamy in every bite.",
    intro:
      "Big, whole kaju with a soft, buttery crunch — sealed in a clear can so you can see every nut before you open it.",
    hero: l("kaju-pour", "Being Nutty whole cashews spilling out of the can into a bowl"),
    taste: "Mild, creamy and buttery with a gentle crunch.",
    bestFor: "Snacking, rich curries and pulao, kaju katli and smoothies.",
    features: [
      {
        title: "Whole, not broken",
        text: "The can is filled with whole cashews, so every handful looks as good as it tastes.",
        image: p("kaju-cashews", "close-up", "Close-up of whole Being Nutty cashews"),
      },
      {
        title: "One ingredient",
        text: "Premium whole cashews — nothing added, nothing coated. Read it right on the label.",
        image: p("kaju-cashews", "label", "Being Nutty Whole Cashews label"),
      },
      {
        title: "Made for sharing",
        text: "Pour into a bowl for guests, or keep the can on your desk for everyday snacking.",
        image: p("kaju-cashews", "styled", "Bowl of Being Nutty cashews beside the can"),
      },
    ],
    uses: [
      { use: "snack", title: "Straight from the can", text: "A creamy handful any time of day." },
      { use: "cook", title: "Curries & pulao", text: "Blend into gravies or toss into rice." },
      { use: "sweets", title: "Mithai & kheer", text: "For kaju katli, halwa and kheer." },
      { use: "gift", title: "Festive gifting", text: "A clear can that looks good on any table." },
    ],
  },
  "badam-almonds": {
    kind: "Raw",
    headline: "California almonds for your daily handful.",
    intro:
      "100% whole California almonds with a firm crunch — perfect to soak overnight or eat straight from the can.",
    hero: l("badam-styled", "Being Nutty California almonds in a bowl beside the tall can"),
    taste: "Nutty and mildly sweet with a firm, satisfying crunch.",
    bestFor: "Soaking overnight, breakfast bowls, badam milk and baking.",
    features: [
      {
        title: "100% California almonds",
        text: "Whole almonds from California — the origin is printed right on the label.",
        image: p("badam-almonds", "close-up", "Close-up of whole California almonds"),
      },
      {
        title: "Nothing else inside",
        text: "No salt, no oil, no coating. Just whole almonds, as they should be.",
        image: p("badam-almonds", "label", "Being Nutty California Almonds label"),
      },
      {
        title: "Soak, peel, enjoy",
        text: "Soak a handful in water overnight and peel in the morning for a softer bite.",
        image: p("badam-almonds", "poured", "Being Nutty almonds poured beside the can"),
      },
    ],
    uses: [
      { use: "soak", title: "Soaked overnight", text: "The classic morning handful." },
      { use: "breakfast", title: "Breakfast bowls", text: "Chop over oats, muesli or yoghurt." },
      { use: "milk", title: "Badam milk", text: "Blend with warm milk, saffron and cardamom." },
      { use: "bake", title: "Baking", text: "Slivered on cakes, cookies and barfi." },
    ],
  },
  "pista-pistachios": {
    kind: "Raw",
    headline: "That signature green, ready to snack.",
    intro:
      "Shelled pistachio kernels with a rich, buttery flavour — no shells to crack, just open the can and enjoy.",
    hero: l("pista-styled", "Being Nutty pistachio kernels scattered around the tall can"),
    taste: "Rich, buttery and slightly sweet.",
    bestFor: "Snacking, kheer and kulfi, mithai garnish and baking.",
    features: [
      {
        title: "Already shelled",
        text: "Pistachio kernels, ready to eat or chop — no cracking, no mess.",
        image: p("pista-pistachios", "close-up", "Close-up of Being Nutty pistachio kernels"),
      },
      {
        title: "Just pistachios",
        text: "One ingredient: pistachio kernels. Nothing added.",
        image: p("pista-pistachios", "label", "Being Nutty Pistachio Kernels label"),
      },
      {
        title: "Colour on every dish",
        text: "That green crowns kheer, kulfi, biryani and every box of mithai.",
        image: p("pista-pistachios", "styled", "Pistachio kernels in a bowl beside the can"),
      },
    ],
    uses: [
      { use: "snack", title: "Snack-ready", text: "A rich handful, no shells to crack." },
      { use: "garnish", title: "Garnish", text: "Slivered over kheer, kulfi and biryani." },
      { use: "sweets", title: "Mithai", text: "For barfi, ladoo and pista rolls." },
      { use: "bake", title: "Baking", text: "In cookies, cakes and ice creams." },
    ],
  },
  "roasted-kaju-cashews": {
    kind: "Smoked",
    headline: "Smoked cashews with a savoury crunch.",
    intro: `Whole cashew kernels ${SMOKED_RECIPE}. Ready to eat the moment you peel the seal.`,
    hero: p("roasted-kaju-cashews", "styled", "Being Nutty Smoked Cashews served beside the can"),
    taste: "Smoky, lightly salted and crunchy.",
    bestFor: "Tea-time snacking, travel, parties and work breaks.",
    features: [
      {
        title: "A short, honest recipe",
        text: "Roasted cashew kernels (98.3%), iodised salt (1.2%) and olive oil (0.5%).",
        image: p("roasted-kaju-cashews", "label", "Being Nutty Smoked Cashews label"),
      },
      {
        title: "Ready to eat",
        text: "Open, snack, reseal — no roasting or seasoning needed at home.",
        image: p("roasted-kaju-cashews", "tall-can", "Tall can of Being Nutty Smoked Cashews"),
      },
      {
        title: "Part of the Smoked range",
        text: "Line it up with Smoked Badam and Smoked Pista for a full snack board.",
        image: l("smoked-trio", "Being Nutty Smoked Almonds, Cashews and Pistachios side by side"),
      },
    ],
    uses: [
      { use: "snack", title: "Tea-time", text: "The savoury side of your chai." },
      { use: "party", title: "Parties", text: "Pour into a bowl and watch it disappear." },
      { use: "travel", title: "Travel", text: "A sturdy can that survives the bag." },
      { use: "work", title: "Work breaks", text: "A better desk snack than chips." },
    ],
  },
  "roasted-badam-almonds": {
    kind: "Smoked",
    headline: "Smoked almonds, deep and toasty.",
    intro: `Whole almond kernels ${SMOKED_RECIPE}. A crunchy, savoury swap for fried snacks.`,
    hero: p("roasted-badam-almonds", "styled", "Being Nutty Smoked Almonds served beside the can"),
    taste: "Deep, toasty and lightly salted with a hard crunch.",
    bestFor: "Evening snacking, travel, parties and salads.",
    features: [
      {
        title: "A short, honest recipe",
        text: "Roasted almond kernels (98.3%), iodised salt (1.2%) and olive oil (0.5%).",
        image: p("roasted-badam-almonds", "label", "Being Nutty Smoked Almonds label"),
      },
      {
        title: "Ready to eat",
        text: "No roasting needed — open the can and snack.",
        image: p("roasted-badam-almonds", "tall-can", "Tall can of Being Nutty Smoked Almonds"),
      },
      {
        title: "Part of the Smoked range",
        text: "Pair with Smoked Kaju and Smoked Pista for a full snack board.",
        image: l("smoked-trio-mist", "Being Nutty Smoked range with a wisp of smoke"),
      },
    ],
    uses: [
      { use: "snack", title: "Evening snack", text: "Savoury crunch without the frying." },
      { use: "party", title: "Snack boards", text: "Next to cheese, fruit and crackers." },
      { use: "travel", title: "Travel", text: "Sturdy can, resealable lid." },
      { use: "cook", title: "Salads", text: "Chop over salads for crunch." },
    ],
  },
  "roasted-pista-pistachios": {
    kind: "Smoked",
    headline: "Smoked pistachios with a bold bite.",
    intro: `Pistachio kernels ${SMOKED_RECIPE}. Shelled, salted and ready for movie night.`,
    hero: p("roasted-pista-pistachios", "styled", "Being Nutty Smoked Pistachios served beside the can"),
    taste: "Bold, buttery and lightly salted.",
    bestFor: "Movie nights, gifting, parties and snacking on the go.",
    features: [
      {
        title: "A short, honest recipe",
        text: "Roasted pistachio kernels (98.3%), iodised salt (1.2%) and olive oil (0.5%).",
        image: p("roasted-pista-pistachios", "label", "Being Nutty Smoked Pistachios label"),
      },
      {
        title: "No shells to crack",
        text: "Kernels only — every bite is pistachio.",
        image: p("roasted-pista-pistachios", "tall-can", "Tall can of Being Nutty Smoked Pistachios"),
      },
      {
        title: "Part of the Smoked range",
        text: "Try it alongside Smoked Kaju and Smoked Badam.",
        image: l("smoked-trio", "Being Nutty Smoked Almonds, Cashews and Pistachios side by side"),
      },
    ],
    uses: [
      { use: "party", title: "Movie nights", text: "Salty, crunchy, no shells on the sofa." },
      { use: "gift", title: "Gifting", text: "A clear can that shows off the green." },
      { use: "travel", title: "On the go", text: "Snack-ready and resealable." },
      { use: "snack", title: "Everyday", text: "A bold handful between meals." },
    ],
  },
  "mix-dry-fruits": {
    kind: "Mix",
    headline: "Three favourites. One can.",
    intro:
      "Whole almonds, cashews and pistachio kernels mixed together, so every handful has a little bit of everything.",
    hero: l("mix-styled", "Being Nutty 3 Mix Nuts with almonds, cashews and pistachios around the can"),
    taste: "Creamy cashews, crunchy almonds and buttery pistachios together.",
    bestFor: "Everyday snacking, lunch boxes, breakfast toppings and gifting.",
    features: [
      {
        title: "Almonds, cashews & pistachios",
        text: "Three of our raw nuts in one can — no fillers, no raisins, no peanuts.",
        image: p("mix-dry-fruits", "styled", "Being Nutty 3 Mix Nuts in a bowl beside the can"),
      },
      {
        title: "What's on the label",
        text: "Almonds, cashew nuts and pistachio kernels. That's it.",
        image: p("mix-dry-fruits", "label", "Being Nutty 3 Mix Nuts label"),
      },
      {
        title: "Short or tall can",
        text: "200 g in the short can for your desk, 400 g in the tall can for the family.",
        image: p("mix-dry-fruits", "tall-can", "Tall can of Being Nutty 3 Mix Nuts"),
      },
    ],
    uses: [
      { use: "snack", title: "Everyday handful", text: "A bit of everything in every bite." },
      { use: "breakfast", title: "Breakfast topping", text: "Over oats, poha or yoghurt." },
      { use: "work", title: "Lunch boxes", text: "A small pot for school or office." },
      { use: "gift", title: "Gifting", text: "One can, three favourites." },
    ],
  },
  "roasted-mix-dry-fruits": {
    kind: "Smoked mix",
    headline: "Smoked, salted and mixed for snacking.",
    intro: `Cashew, almond and pistachio kernels ${SMOKED_RECIPE}. The savoury mix for every occasion.`,
    hero: l("smoked-mix", "Being Nutty Smoked Salted 3 Mix Nuts with a wisp of smoke"),
    taste: "Smoky and lightly salted, with three different crunches.",
    bestFor: "Parties, travel, tea-time and movie nights.",
    features: [
      {
        title: "A short, honest recipe",
        text: "Roasted cashew, pistachio and almond kernels (98.3%), iodised salt (1.2%) and olive oil (0.5%).",
        image: p("roasted-mix-dry-fruits", "label", "Being Nutty Smoked Salted 3 Mix Nuts label"),
      },
      {
        title: "Three nuts, one can",
        text: "Cashews, almonds and pistachios — all smoked, all lightly salted.",
        image: p("roasted-mix-dry-fruits", "styled", "Being Nutty Smoked Salted 3 Mix Nuts served beside the can"),
      },
      {
        title: "Ready to eat",
        text: "Peel the seal and pour. No roasting or seasoning needed.",
        image: p("roasted-mix-dry-fruits", "tall-can", "Tall can of Being Nutty Smoked Salted 3 Mix Nuts"),
      },
    ],
    uses: [
      { use: "party", title: "Parties", text: "One bowl, three crunches." },
      { use: "snack", title: "Tea-time", text: "The savoury side of your chai." },
      { use: "travel", title: "Road trips", text: "Sturdy can, resealable lid." },
      { use: "work", title: "Desk drawer", text: "A better 4 pm snack." },
    ],
  },
};

export const STORAGE_TIP =
  "Close the lid tightly after every use and keep the can in a cool, dry place away from sunlight. In humid weather, refrigerate for longer freshness.";

/** Direct question-and-answer facts for answer engines and shoppers who skim. */
export function aplusFacts(
  name: string,
  a: APlusContent,
  info: { ingredients: string | null; sizes: string; origin: string | null },
) {
  return [
    { key: "what", q: `What is Being Nutty ${name}?`, a: a.intro },
    ...(info.ingredients ? [{ key: "ingredients", q: `What are the ingredients in ${name}?`, a: `${info.ingredients}.` }] : []),
    { key: "taste", q: `How does ${name} taste?`, a: a.taste },
    { key: "best-for", q: `What is ${name} best for?`, a: a.bestFor },
    { key: "sizes", q: `What sizes does ${name} come in?`, a: `${info.sizes}.` },
    ...(info.origin ? [{ key: "origin", q: `Where are the nuts from?`, a: `${info.origin}.` }] : []),
    { key: "storage", q: `How should I store ${name}?`, a: STORAGE_TIP },
  ];
}
