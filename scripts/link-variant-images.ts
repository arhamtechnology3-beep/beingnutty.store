// Links can photos to sizes so choosing a size shows its own can first:
// the tall-can photo goes with the size packed in the tall can, the front photo with the short can.
// Only fills images that aren't linked yet, so choices made in the admin are kept.
// Usage: npx tsx scripts/link-variant-images.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const isTall = (packaging: string | null) => /tall/i.test(packaging ?? "");

async function main() {
  const products = await prisma.product.findMany({ include: { images: true, variants: true } });
  for (const p of products) {
    const tall = p.variants.filter((v) => isTall(v.packaging));
    const short = p.variants.filter((v) => !isTall(v.packaging));
    // Only link when there's exactly one size of each kind, otherwise the choice is ambiguous.
    if (tall.length !== 1 || short.length !== 1) {
      console.log(`skip ${p.slug} (${short.length} short, ${tall.length} tall sizes)`);
      continue;
    }
    const tallImage = p.images.find((i) => !i.variantId && i.url.includes("tall-can"));
    const frontImage = p.images.find((i) => !i.variantId && /\/front\.\w+$/.test(i.url));
    if (tallImage) await prisma.productImage.update({ where: { id: tallImage.id }, data: { variantId: tall[0].id } });
    if (frontImage) await prisma.productImage.update({ where: { id: frontImage.id }, data: { variantId: short[0].id } });
    console.log(`${p.slug}: ${short[0].title} → ${frontImage ? "front" : "-"}, ${tall[0].title} → ${tallImage ? "tall-can" : "-"}`);
  }
}

main().finally(() => prisma.$disconnect());
