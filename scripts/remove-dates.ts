// Takes Dates and Date Bites off the store without deleting them, so past orders keep their line items.
// Usage: npx tsx scripts/remove-dates.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COLLECTIONS } from "../src/lib/catalog-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PRODUCTS = ["dates-khajur", "date-bites"];

const REDIRECTS = [
  { from: "/collections/dates", to: "/collections/dry-fruits" },
  { from: "/products/dates-khajur", to: "/collections/dry-fruits" },
  { from: "/products/date-bites", to: "/collections/dry-fruits" },
];

const ABOUT_FIXES: [string, string][] = [
  ["smoked nuts, dry fruit mixes, dates and date bites in sturdy cans", "smoked nuts and dry fruit mixes in sturdy cans"],
  ["roasted nuts, dry fruit mixes, dates and date bites in sturdy cans", "smoked nuts and dry fruit mixes in sturdy cans"],
  ["\n- Dates: Dates (khajur), Date Bites", ""],
];

async function main() {
  const products = await prisma.product.updateMany({
    where: { slug: { in: PRODUCTS } },
    data: { status: "ARCHIVED" },
  });
  console.log(`archived ${products.count} products`);

  const collection = await prisma.collection.updateMany({ where: { slug: "dates" }, data: { published: false } });
  console.log(`unpublished ${collection.count} collection`);

  const allCollection = SEED_COLLECTIONS.find((c) => c.slug === "dry-fruits");
  if (allCollection) {
    await prisma.collection.updateMany({ where: { slug: "dry-fruits" }, data: { description: allCollection.description } });
  }

  for (const r of REDIRECTS) {
    await prisma.redirect.upsert({ where: { from: r.from }, update: {}, create: { ...r, permanent: true } });
  }
  console.log(`redirects ready: ${REDIRECTS.length}`);

  const about = await prisma.page.findUnique({ where: { slug: "about" } });
  if (about) {
    const body = ABOUT_FIXES.reduce((text, [from, to]) => text.replace(from, to), about.body);
    if (body !== about.body) {
      await prisma.page.update({ where: { slug: "about" }, data: { body } });
      console.log("about page updated");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
