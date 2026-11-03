import type { Metadata } from "next";
import Link from "next/link";
import { getCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { getShippingSettings } from "@/lib/orders";
import { razorpayConfigured } from "@/lib/razorpay";
import { CheckoutForm, type CheckoutDefaults } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const customer = await getCustomer();
  let defaults: CheckoutDefaults | undefined;
  if (customer) {
    const address = await db.address.findFirst({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
    defaults = {
      email: customer.email,
      phone: address?.phone ?? customer.phone ?? "",
      name: address?.name ?? [customer.firstName, customer.lastName].filter(Boolean).join(" "),
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      pincode: address?.pincode ?? "",
    };
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <h1 className="font-display text-5xl font-black tracking-tight md:text-6xl">Checkout</h1>
      {customer ? (
        <p className="mt-3 text-roast">Signed in as {customer.email}</p>
      ) : (
        <p className="mt-3 text-roast">
          Have an account?{" "}
          <Link href="/account/login?next=/checkout" className="font-semibold text-ink underline">
            Sign in
          </Link>{" "}
          for faster checkout — or continue as a guest.
        </p>
      )}
      <CheckoutForm onlinePayments={razorpayConfigured()} codEnabled={(await getShippingSettings()).codEnabled} defaults={defaults} />
    </div>
  );
}
