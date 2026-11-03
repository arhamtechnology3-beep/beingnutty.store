import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

export async function addOrderEvent(
  orderId: string,
  type: string,
  message: string,
  meta?: Prisma.InputJsonValue,
  client: { orderEvent: typeof db.orderEvent } = db,
) {
  return client.orderEvent.create({
    data: { orderId, type, message, meta: meta ?? undefined },
  });
}
