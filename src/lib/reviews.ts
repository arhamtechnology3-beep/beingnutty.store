import "server-only";
import { db } from "./db";

/** The latest shipped or delivered order where this email bought the product, if any. */
export async function findPurchase(email: string | null | undefined, productId: string) {
  if (!email) return null;
  const item = await db.orderItem.findFirst({
    where: {
      variant: { productId },
      order: {
        email: { equals: email, mode: "insensitive" },
        status: { in: ["SHIPPED", "DELIVERED"] },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
    select: { variantTitle: true, order: { select: { number: true } } },
  });
  return item ? { size: item.variantTitle, orderNumber: item.order.number } : null;
}
