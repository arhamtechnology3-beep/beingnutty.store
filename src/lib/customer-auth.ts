import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSessionCookie, setSessionCookie } from "./jwt";

const CUSTOMER_COOKIE = "bn_customer";
const MAX_AGE = 60 * 60 * 24 * 30;

export async function createCustomerSession(customerId: string) {
  await setSessionCookie(CUSTOMER_COOKIE, "customer", customerId, MAX_AGE);
}

export async function destroyCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export const getCustomer = cache(async () => {
  const customerId = await readSessionCookie(CUSTOMER_COOKIE, "customer");
  if (!customerId) return null;
  // Passwordless customers (KwikPass OTP / guest claim) must still resolve.
  return db.customer.findFirst({
    where: { id: customerId },
    select: { id: true, email: true, phone: true, firstName: true, lastName: true, acceptsMarketing: true },
  });
});

export async function requireCustomer(next = "/account") {
  const customer = await getCustomer();
  if (!customer) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return customer;
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}
