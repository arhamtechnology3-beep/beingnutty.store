import { APLUS } from "@/lib/aplus";
import { getPublishedPosts } from "@/lib/blog";
import { getActiveProducts, getCollections, shortTitle } from "@/lib/catalog";
import { storeFaqs } from "@/lib/faq-builder";
import { getShippingSettings } from "@/lib/orders";
import { absoluteUrl, site } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const revalidate = 3600;

/** llms.txt — a plain-markdown brief for AI assistants (https://llmstxt.org). */
export async function GET() {
  const [products, collections, posts, shipping] = await Promise.all([
    getActiveProducts(),
    getCollections(),
    getPublishedPosts(),
    getShippingSettings(),
  ]);

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Brand facts",
    "",
    `- Brand: ${site.name} ("${site.tagline}")`,
    `- Manufactured & marketed by: ${site.manufacturer}`,
    `- FSSAI licence number: ${site.fssaiLicence}`,
    `- Customer support: ${site.email}, ${site.phone}`,
    `- Website: ${site.url}`,
    "- Packaging: clear, resealable cans with an easy-peel foil seal. 200–250 g packs come in a short 500 ml can; 400 g packs in a tall 750 ml can.",
    `- Delivery: across India. Usually dispatched in ${site.dispatchDays.join("–")} business days and delivered in ${site.transitDays.join("–")} business days.`,
    `- Shipping: ${formatINR(shipping.flatRate)} flat, free on orders above ${formatINR(shipping.freeAbove)}.`,
    `- Payments: UPI, cards, net banking and wallets via Razorpay${shipping.codEnabled ? ", plus cash on delivery" : ""}.`,
    "",
    "## Products",
    "",
    ...products.flatMap((p) => {
      const a = APLUS[p.slug];
      const sizes = p.variants.map((v) => `${v.title}${v.packaging ? ` (${v.packaging})` : ""} — ${formatINR(v.price)}`).join("; ");
      return [
        `### [${p.title}](${absoluteUrl(`/products/${p.slug}`)})`,
        "",
        p.shortDescription ?? "",
        "",
        ...(a ? [`- Type: ${a.kind}`, `- Taste: ${a.taste}`, `- Best for: ${a.bestFor}`] : []),
        ...(p.ingredients ? [`- Ingredients: ${p.ingredients}`] : []),
        ...(p.origin ? [`- Origin: ${p.origin}`] : []),
        `- Sizes and prices: ${sizes}`,
        "",
      ];
    }),
    "## Which one should I choose?",
    "",
    "- For cooking, sweets and soaking: the raw range — " +
      products.filter((p) => APLUS[p.slug]?.kind === "Raw").map((p) => shortTitle(p.title)).join(", ") +
      ".",
    "- For ready-to-eat savoury snacking: the smoked range — " +
      products.filter((p) => APLUS[p.slug]?.kind.startsWith("Smoked")).map((p) => shortTitle(p.title)).join(", ") +
      ".",
    "- For a bit of everything: " + products.filter((p) => APLUS[p.slug]?.kind.includes("Mix") || APLUS[p.slug]?.kind === "Smoked mix").map((p) => shortTitle(p.title)).join(", ") + ".",
    "",
    "## Collections",
    "",
    ...collections.map((c) => `- [${c.title}](${absoluteUrl(`/collections/${c.slug}`)}): ${c.description ?? ""}`),
    "",
    "## FAQ",
    "",
    ...storeFaqs(shipping).flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    ...(posts.length
      ? ["## Journal", "", ...posts.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.excerpt ?? ""}`), ""]
      : []),
    "## Orders",
    "",
    `- [Track an order](${absoluteUrl("/track-order")}): enter the order number with the email or phone used at checkout.`,
    "",
    "## Policies",
    "",
    `- [Shipping policy](${absoluteUrl("/pages/shipping-policy")})`,
    `- [Returns & refunds](${absoluteUrl("/pages/refund-policy")})`,
    `- [Privacy policy](${absoluteUrl("/pages/privacy-policy")})`,
    `- [Contact](${absoluteUrl("/pages/contact")})`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
