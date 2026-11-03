import { db } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayEvent = {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string } };
  };
};

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as RazorpayEvent;
  const payment = event.payload.payment?.entity;

  if (payment && (event.event === "payment.captured" || event.event === "order.paid")) {
    await markOrderPaid(payment.order_id, payment.id);
  }
  if (payment && event.event === "payment.failed") {
    await db.order.updateMany({
      where: { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });
  }

  return Response.json({ received: true });
}
