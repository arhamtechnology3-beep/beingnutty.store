import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COLLECTIONS, SEED_PRODUCTS } from "../src/lib/catalog-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Draft copy — review with the business (and a lawyer for policies) before launch.
const DRAFT_PAGES = [
  {
    slug: "about",
    title: "About Being Nutty",
    body: "Being Nutty is an Indian dry fruit brand. We pack whole kaju, badam and pista, smoked nuts and dry fruit mixes in sturdy cans, and deliver them across India.\n\n## Our range\n\n- Raw: Kaju, Badam, Pista\n- Smoked: Smoked Kaju, Smoked Badam, Smoked Pista\n- Mixes: 3 Mix Nuts, Smoked Salted 3 Mix Nuts",
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    body: "We ship to serviceable pincodes across India.\n\n## Dispatch\n\nOrders are usually dispatched within 1–2 business days.\n\n## Delivery time\n\nMost orders arrive within 3–7 business days depending on your location.\n\n## Shipping charges\n\nShipping charges, if any, are shown at checkout before you pay.",
  },
  {
    slug: "refund-policy",
    title: "Returns & Refund Policy",
    body: "Because our products are food items, we cannot accept returns of opened cans.\n\n## Damaged or wrong items\n\nIf your order arrives damaged or you received the wrong item, contact us within 48 hours of delivery with photos and your order number. We will send a replacement or issue a refund.\n\n## Refund timeline\n\nApproved refunds are processed to the original payment method within 5–7 business days.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    body: "We collect the information you give us when you place an order or sign up for updates — such as your name, email, phone number and delivery address — to process orders and communicate with you.\n\nPayments are processed securely by Razorpay. We do not store your card details.\n\nWe never sell your personal data. You can ask us to delete your data at any time by emailing us.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    body: "By using this website and placing an order you agree to these terms.\n\nPrices are listed in Indian Rupees and include applicable taxes. We may update prices and product availability at any time.\n\nOrders are confirmed once payment is received, or when a cash on delivery order is accepted.",
  },
  {
    slug: "contact",
    title: "Contact Us",
    body: "Have a question about your order or our products? We'd love to hear from you.\n\nEmail: support@arhamfoods.co.in\n\nPhone: +91 93248 09074\n\nBeing Nutty is manufactured and marketed by Arham Foods, Meghdoot Signature, Virar East, Palghar, Maharashtra 401305.",
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Store Owner",
        role: "OWNER",
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`Admin user ready: ${email}`);
  }

  for (const [position, c] of SEED_COLLECTIONS.entries()) {
    const collection = await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { title: c.title, description: c.description, position },
      create: { ...c, position },
    });
    if (c.image && !collection.image) {
      await prisma.collection.update({ where: { id: collection.id }, data: { image: c.image } });
    }
  }

  for (const p of SEED_PRODUCTS) {
    const { variants, collections, faqs, images = [], ...fields } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...fields, faqs, status: "ACTIVE" },
    });

    // Fill gaps only, so edits made in the admin are never overwritten.
    const gaps = {
      ...(fields.ingredients && !product.ingredients && { ingredients: fields.ingredients }),
      ...(fields.origin && !product.origin && { origin: fields.origin }),
    };
    if (Object.keys(gaps).length) {
      await prisma.product.update({ where: { id: product.id }, data: gaps });
    }
    if (images.length && (await prisma.productImage.count({ where: { productId: product.id } })) === 0) {
      await prisma.productImage.createMany({
        data: images.map((img, position) => ({ ...img, position, productId: product.id })),
      });
    }

    for (const [position, v] of variants.entries()) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: { ...v, position, productId: product.id, inventoryQty: 100 },
      });
    }

    for (const slug of collections) {
      const collection = await prisma.collection.findUniqueOrThrow({ where: { slug } });
      await prisma.productCollection.upsert({
        where: { productId_collectionId: { productId: product.id, collectionId: collection.id } },
        update: {},
        create: { productId: product.id, collectionId: collection.id },
      });
    }
  }

  for (const page of DRAFT_PAGES) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }

  await prisma.setting.upsert({
    where: { key: "shipping" },
    update: {},
    create: { key: "shipping", value: { flatRate: 4900, freeAbove: 49900 } },
  });

  console.log(`Seeded ${SEED_PRODUCTS.length} products, ${SEED_COLLECTIONS.length} collections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
