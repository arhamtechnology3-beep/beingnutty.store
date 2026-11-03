"use server";

import { z } from "zod";
import { getCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { confirmCodOrder, getShippingSettings, markOrderPaid, quoteCart, type Quote } from "@/lib/orders";
import { getRazorpay, razorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";

const lineSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) });
const linesSchema = z.array(lineSchema).min(1).max(50);

export async function getQuote(lines: unknown, discountCode?: string): Promise<Quote | { errors: string[] }> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return { errors: ["Your cart is empty."] };
  return quoteCart(parsed.data, discountCode || null);
}

const checkoutSchema = z.object({
  lines: linesSchema,
  discountCode: z.string().max(40).optional(),
  email: z.email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  name: z.string().min(2).max(80),
  line1: z.string().min(3).max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  note: z.string().max(500).optional(),
  attribution: z
    .object({
      utmSource: z.string().max(120).nullable().optional(),
      utmMedium: z.string().max(120).nullable().optional(),
      utmCampaign: z.string().max(160).nullable().optional(),
      utmContent: z.string().max(160).nullable().optional(),
      utmTerm: z.string().max(160).nullable().optional(),
      referrer: z.string().max(500).nullable().optional(),
      landingPage: z.string().max(500).nullable().optional(),
      sourceChannel: z.string().max(120).optional(),
    })
    .optional(),
  journey: z
    .array(
      z.object({
        at: z.string(),
        type: z.enum(["page", "product", "add_to_cart", "checkout"]),
        path: z.string().optional(),
        title: z.string().optional(),
        productSlug: z.string().optional(),
        productTitle: z.string().optional(),
        variantTitle: z.string().optional(),
      }),
    )
    .max(50)
    .optional(),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: false; error: string }
  | { ok: true; kind: "cod"; orderId: string }
  | {
      ok: true;
      kind: "razorpay";
      orderId: string;
      razorpayOrderId: string;
      amount: number;
      keyId: string;
      prefill: { name: string; email: string; contact: string };
    };

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  const data = parsed.data;

  if (data.paymentMethod === "RAZORPAY" && !razorpayConfigured()) {
    return { ok: false, error: "Online payment isn't set up yet. Please choose cash on delivery." };
  }
  if (data.paymentMethod === "COD" && !(await getShippingSettings()).codEnabled) {
    return { ok: false, error: "Cash on delivery isn't available right now. Please pay online." };
  }

  const quote = await quoteCart(data.lines, data.discountCode || null);
  if (quote.errors.length || quote.items.length === 0) return { ok: false, error: quote.errors[0] ?? "Your cart is empty." };

  const email = data.email.toLowerCase();
  const signedIn = await getCustomer();
  const customer = signedIn
    ? signedIn
    : await db.customer.upsert({
        where: { email },
        update: { phone: data.phone },
        create: { email, phone: data.phone, firstName: data.name.split(" ")[0], lastName: data.name.split(" ").slice(1).join(" ") || null },
      });
  if (signedIn && (await db.address.count({ where: { customerId: signedIn.id } })) === 0) {
    await db.address.create({
      data: {
        customerId: signedIn.id,
        name: data.name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: true,
      },
    });
  }

  const attr = data.attribution;
  const order = await db.order.create({
    data: {
      customerId: customer.id,
      email,
      phone: data.phone,
      paymentMethod: data.paymentMethod,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      shippingTotal: quote.shippingTotal,
      total: quote.total,
      discountCode: quote.appliedCode,
      note: data.note,
      sourceChannel: attr?.sourceChannel ?? null,
      utmSource: attr?.utmSource ?? null,
      utmMedium: attr?.utmMedium ?? null,
      utmCampaign: attr?.utmCampaign ?? null,
      utmContent: attr?.utmContent ?? null,
      utmTerm: attr?.utmTerm ?? null,
      referrer: attr?.referrer ?? null,
      landingPage: attr?.landingPage ?? null,
      journey: data.journey ?? undefined,
      shippingAddress: {
        name: data.name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 ?? "",
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: "IN",
      },
      items: {
        create: quote.items.map((i) => ({
          variantId: i.variantId,
          productTitle: i.productTitle,
          variantTitle: i.variantTitle,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
        })),
      },
      events: {
        create: [
          {
            type: "ORDER_PLACED",
            message: `Order placed (${data.paymentMethod === "COD" ? "cash on delivery" : "online payment"})`,
            meta: {
              sourceChannel: attr?.sourceChannel ?? "Direct / Website",
              itemCount: quote.items.length,
            },
          },
        ],
      },
    },
  });

  if (data.paymentMethod === "COD") {
    await confirmCodOrder(order.id);
    return { ok: true, kind: "cod", orderId: order.id };
  }

  const rzpOrder = await getRazorpay().orders.create({
    amount: quote.total,
    currency: "INR",
    receipt: `BN-${order.number}`,
    notes: { orderId: order.id },
  });
  await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });

  return {
    ok: true,
    kind: "razorpay",
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: quote.total,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID!,
    prefill: { name: data.name, email, contact: data.phone },
  };
}

export async function confirmPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ ok: boolean; orderId?: string }> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return { ok: false };
  const order = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
  return { ok: Boolean(order), orderId: order?.id };
}
