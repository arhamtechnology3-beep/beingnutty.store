import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/kwikpass-token";

/** Merchant endpoint for KwikForms submissions (GoKwik posts / browser posts kf:submitted). */
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const phone = normalizePhone(typeof data.phone === "string" ? data.phone : null);
    const email =
      (typeof data.email === "string" && data.email.includes("@") && data.email.toLowerCase()) ||
      (phone ? `kp${phone}@customers.beingnutty.store` : "lead@beingnutty.store");
    const name =
      [data.firstName ?? data.first_name, data.lastName ?? data.last_name].filter(Boolean).join(" ").trim() ||
      (typeof data.name === "string" && data.name.trim()) ||
      "KwikPass lead";

    const address =
      data.address && typeof data.address === "object"
        ? JSON.stringify(data.address)
        : [data.address, data.city, data.pincode].filter(Boolean).join(", ");

    await db.contactMessage.create({
      data: {
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 160),
        phone: phone,
        message: `KwikForms lead\n${address ? `Address: ${address}\n` : ""}${JSON.stringify(data).slice(0, 3500)}`,
      },
    });

    if (phone) {
      const existing = await db.customer.findFirst({ where: { OR: [{ phone }, { email }] } });
      if (existing) {
        await db.customer.update({
          where: { id: existing.id },
          data: {
            phone,
            firstName: existing.firstName || String(name).split(" ")[0],
            lastName: existing.lastName || String(name).split(" ").slice(1).join(" ") || null,
            acceptsMarketing: true,
          },
        });
      } else {
        await db.customer.create({
          data: {
            email: String(email),
            phone,
            firstName: String(name).split(" ")[0] || "Lead",
            lastName: String(name).split(" ").slice(1).join(" ") || null,
            acceptsMarketing: Boolean(data.consent ?? true),
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[kwikpass/forms]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
