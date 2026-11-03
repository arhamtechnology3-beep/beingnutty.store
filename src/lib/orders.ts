import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { buildSafe } from "./build-safe";
import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import { DEFAULT_REWARDS, rewardFor, type RewardTier } from "./rewards";
import { softDb } from "./soft-db";

export type LineInput = { variantId: string; quantity: number };

export type ShippingSettings = { flatRate: number; freeAbove: number; codEnabled: boolean; rewards: RewardTier[] };

const DEFAULT_SHIPPING: ShippingSettings = {
  flatRate: 4900,
  freeAbove: 49900,
  codEnabled: true,
  rewards: DEFAULT_REWARDS,
};

const cachedShippingSettings = unstable_cache(
  () =>
    softDb(async () => {
      const row = await db.setting.findUnique({ where: { key: "shipping" } });
      const value = (row?.value ?? {}) as Partial<ShippingSettings>;
      return {
        flatRate: value.flatRate ?? DEFAULT_SHIPPING.flatRate,
        freeAbove: value.freeAbove ?? DEFAULT_SHIPPING.freeAbove,
        codEnabled: value.codEnabled ?? DEFAULT_SHIPPING.codEnabled,
        rewards: Array.isArray(value.rewards) ? value.rewards : DEFAULT_REWARDS,
      };
    }, DEFAULT_SHIPPING),
  ["shipping-settings"],
  { revalidate: 120, tags: ["shipping"] },
);

export const getShippingSettings = cache(async (): Promise<ShippingSettings> =>
  buildSafe(() => cachedShippingSettings(), DEFAULT_SHIPPING),
);

export type Quote = Awaited<ReturnType<typeof quoteCart>>;

/** Prices a cart from the database — never trust client prices. */
export async function quoteCart(lines: LineInput[], discountCode?: string | null) {
  const errors: string[] = [];
  const ids = lines.map((l) => l.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: ids }, product: { status: "ACTIVE" } },
    include: { product: { select: { title: true, slug: true } } },
  });

  const items = lines.flatMap((line) => {
    const v = variants.find((x) => x.id === line.variantId);
    if (!v) {
      errors.push("An item in your cart is no longer available.");
      return [];
    }
    const quantity = Math.max(1, Math.min(20, Math.floor(line.quantity)));
    if (v.trackInventory && v.inventoryQty < quantity) {
      errors.push(`${v.product.title} (${v.title}) has only ${Math.max(0, v.inventoryQty)} left.`);
    }
    return [
      {
        variantId: v.id,
        productTitle: v.product.title,
        variantTitle: v.title,
        sku: v.sku,
        price: v.price,
        quantity,
        lineTotal: v.price * quantity,
      },
    ];
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  const shipping = await getShippingSettings();
  const notes: string[] = [];
  let codeDiscount = 0;
  let freeShipping = false;
  let appliedCode: string | null = null;
  if (discountCode) {
    const code = discountCode.trim().toUpperCase();
    const now = new Date();
    const d = await db.discount.findUnique({ where: { code } });
    const valid =
      d &&
      d.active &&
      (!d.startsAt || d.startsAt <= now) &&
      (!d.endsAt || d.endsAt >= now) &&
      (d.usageLimit === null || d.usedCount < d.usageLimit);
    if (!valid) {
      errors.push(`Discount code “${code}” is not valid.`);
    } else if (subtotal < d.minSubtotal) {
      errors.push(`Add ₹${Math.ceil((d.minSubtotal - subtotal) / 100)} more to use “${code}”.`);
    } else {
      appliedCode = d.code;
      if (d.type === "PERCENTAGE") codeDiscount = Math.round((subtotal * Math.min(d.value, 100)) / 100);
      if (d.type === "FIXED") codeDiscount = Math.min(d.value, subtotal);
      if (d.type === "FREE_SHIPPING") freeShipping = true;
    }
  }

  // Cart rewards and money-off codes don't stack — the customer gets whichever is bigger.
  const reward = rewardFor(subtotal, shipping.rewards);
  const rewardWins = reward.discount > codeDiscount;
  if (rewardWins && codeDiscount > 0) {
    notes.push(`Your ${reward.percent}% cart reward is bigger than code “${appliedCode}”, so we applied the reward.`);
    appliedCode = null;
  }
  const discountTotal = rewardWins ? reward.discount : codeDiscount;
  const discountLabel = rewardWins ? `${reward.percent}% cart reward` : appliedCode ? `Code ${appliedCode}` : null;

  const afterDiscount = subtotal - discountTotal;
  const shippingTotal = items.length === 0 || freeShipping || afterDiscount >= shipping.freeAbove ? 0 : shipping.flatRate;

  return {
    items,
    subtotal,
    discountTotal,
    shippingTotal,
    total: afterDiscount + shippingTotal,
    appliedCode,
    discountLabel,
    freeShippingAbove: shipping.freeAbove,
    errors,
    notes,
  };
}

/** Decrements stock and counts discount usage once an order is confirmed. */
async function commitOrder(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.productVariant.updateMany({
      where: { id: item.variantId, trackInventory: true },
      data: { inventoryQty: { decrement: item.quantity } },
    });
  }
  if (order.discountCode) {
    await tx.discount.updateMany({ where: { code: order.discountCode }, data: { usedCount: { increment: 1 } } });
  }
}

export async function confirmCodOrder(orderId: string) {
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });
    await commitOrder(tx, orderId);
    await tx.orderEvent.create({
      data: { orderId, type: "ORDER_CONFIRMED", message: "Order confirmed (cash on delivery)" },
    });
  });
  const { afterOrderConfirmed } = await import("./order-notify");
  await afterOrderConfirmed(orderId);
}

/** Idempotent: safe to call from both the checkout callback and the webhook. */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const order = await db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { razorpayOrderId, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId },
    });
    const row = await tx.order.findUnique({ where: { razorpayOrderId } });
    if (updated.count === 1 && row) {
      await commitOrder(tx, row.id);
      await tx.orderEvent.create({
        data: {
          orderId: row.id,
          type: "PAYMENT_PAID",
          message: "Payment received via Razorpay",
          meta: { razorpayPaymentId },
        },
      });
    }
    return { order: row, newlyPaid: updated.count === 1 };
  });
  if (order.newlyPaid && order.order) {
    const { afterOrderConfirmed } = await import("./order-notify");
    await afterOrderConfirmed(order.order.id);
  }
  return order.order;
}
