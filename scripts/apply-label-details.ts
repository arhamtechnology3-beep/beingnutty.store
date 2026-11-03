// One-off sync of the naming and contact details printed on the product labels
// (Smoked range, 3 Mix Nuts, can sizes, Arham Foods contact) into an existing database.
// Usage: npx tsx scripts/apply-label-details.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COLLECTIONS, SEED_PRODUCTS } from "../src/lib/catalog-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const RENAMED = [
  "roasted-kaju-cashews",
  "roasted-badam-almonds",
  "roasted-pista-pistachios",
  "mix-dry-fruits",
  "roasted-mix-dry-fruits",
];

const PAGE_FIXES: Record<string, [string, string][]> = {
  about: [
    ["roasted nuts, dry fruit mixes", "smoked nuts, dry fruit mixes"],
    ["- Roasted: Roasted Kaju, Roasted Badam, Roasted Pista", "- Smoked: Smoked Kaju, Smoked Badam, Smoked Pista"],
    ["- Mixes: Mix Dry Fruit, Roasted Mix Dry Fruit", "- Mixes: 3 Mix Nuts, Smoked Salted 3 Mix Nuts"],
  ],
  contact: [
    [
      "Email: hello@beingnutty.in",
      "Email: support@arhamfoods.co.in\n\nPhone: +91 93248 09074\n\nBeing Nutty is manufactured and marketed by Arham Foods, Meghdoot Signature, Virar East, Palghar, Maharashtra 401305.",
    ],
  ],
};

async function main() {
  for (const p of SEED_PRODUCTS.filter((p) => RENAMED.includes(p.slug))) {
    const { title, shortDescription, description, highlights, tags, faqs } = p;
    const res = await prisma.product.updateMany({
      where: { slug: p.slug },
      data: { title, shortDescription, description, highlights, tags, faqs },
    });
    console.log(`product ${p.slug}: ${res.count ? "updated" : "not found"}`);
  }

  for (const p of SEED_PRODUCTS) {
    for (const v of p.variants) {
      await prisma.productVariant.updateMany({ where: { sku: v.sku }, data: { packaging: v.packaging } });
    }
  }
  console.log("variant packaging synced");

  for (const c of SEED_COLLECTIONS) {
    await prisma.collection.updateMany({
      where: { slug: c.slug },
      data: { title: c.title, description: c.description },
    });
  }
  console.log("collections synced");

  for (const [slug, fixes] of Object.entries(PAGE_FIXES)) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) continue;
    const body = fixes.reduce((text, [from, to]) => text.replace(from, to), page.body);
    if (body !== page.body) {
      await prisma.page.update({ where: { slug }, data: { body } });
      console.log(`page ${slug}: updated`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
