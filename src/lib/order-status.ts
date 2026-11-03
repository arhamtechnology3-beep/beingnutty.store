import type { OrderStatus } from "@/generated/prisma/enums";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const ORDER_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const satisfies readonly OrderStatus[];

/** Index of the furthest completed fulfilment step, or -1 for pending / cancelled / refunded orders. */
export function orderStepIndex(status: OrderStatus) {
  return (ORDER_STEPS as readonly OrderStatus[]).indexOf(status);
}
