import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { decryptKpToken, normalizePhone } from "@/lib/kwikpass-token";

const bodySchema = z.object({
  kpToken: z.string().min(20),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  next: z.string().optional(),
});

/** Exchange a verified KwikPass kpToken for a Being Nutty customer session. */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const payload = await decryptKpToken(parsed.data.kpToken);
    const phone = normalizePhone(payload.phone) || normalizePhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ ok: false, error: "Could not read a valid phone from KwikPass." }, { status: 400 });
    }

    const emailFromToken = typeof payload.email === "string" && payload.email.includes("@") ? payload.email.toLowerCase() : null;
    const emailFromBody = parsed.data.email?.trim().toLowerCase() || null;
    const email = emailFromToken || emailFromBody || `kp${phone}@customers.beingnutty.store`;

    const firstName =
      (typeof payload.firstName === "string" && payload.firstName) ||
      (typeof payload.first_name === "string" && payload.first_name) ||
      "Being Nutty";
    const lastName =
      (typeof payload.lastName === "string" && payload.lastName) ||
      (typeof payload.last_name === "string" && payload.last_name) ||
      null;

    let customer = await db.customer.findFirst({ where: { OR: [{ phone }, { email }] } });
    if (customer) {
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          phone,
          email: customer.email || email,
          firstName: customer.firstName || String(firstName),
          lastName: customer.lastName || (lastName ? String(lastName) : null),
        },
      });
    } else {
      customer = await db.customer.create({
        data: {
          email,
          phone,
          firstName: String(firstName),
          lastName: lastName ? String(lastName) : null,
          acceptsMarketing: true,
        },
      });
    }

    await createCustomerSession(customer.id);
    const next = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/account";
    return NextResponse.json({ ok: true, next, customerId: customer.id });
  } catch (error) {
    console.error("[kwikpass/session]", error);
    return NextResponse.json({ ok: false, error: "KwikPass login failed. Check KWIKPASS_JWE_SECRET." }, { status: 500 });
  }
}
