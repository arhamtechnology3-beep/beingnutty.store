import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Field, StorePage, storeButton, storeField } from "@/components/store/fields";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { formatINR } from "@/lib/utils";
import { AccountNav } from "./account-nav";
import { changePassword, updateProfile } from "./actions";

export default async function AccountPage() {
  const customer = await requireCustomer();
  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 50,
  });

  return (
    <StorePage title={`Hi, ${customer.firstName ?? "there"}`} width="max-w-5xl">
      <AccountNav current="/account" />

      <section className="mt-12" aria-labelledby="orders-title">
        <h2 id="orders-title" className="font-display text-3xl font-bold">
          Your orders
        </h2>
        {orders.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-paper p-10 text-center">
            <p className="text-lg text-roast">You haven&apos;t placed an order yet.</p>
            <Link href="/collections/dry-fruits" className={`${storeButton} mt-6`}>
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line rounded-[2rem] bg-paper px-6">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 py-5 hover:opacity-80">
                  <span>
                    <span className="block font-semibold">Order #{o.number}</span>
                    <span className="text-sm text-roast">
                      {o.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} · {o._count.items} item
                      {o._count.items === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold">{ORDER_STATUS_LABEL[o.status]}</span>
                  <span className="font-semibold tabular-nums">{formatINR(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="profile-title">
          <h2 id="profile-title" className="font-display text-3xl font-bold">
            Profile
          </h2>
          <p className="mt-1 text-sm text-roast">{customer.email}</p>
          <ActionForm action={updateProfile} submitLabel="Save profile" className="mt-6 space-y-4" buttonClassName={storeButton} tone="store">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input name="firstName" required defaultValue={customer.firstName ?? ""} className={storeField} />
              </Field>
              <Field label="Last name">
                <input name="lastName" defaultValue={customer.lastName ?? ""} className={storeField} />
              </Field>
            </div>
            <Field label="Mobile number">
              <input name="phone" type="tel" required inputMode="numeric" defaultValue={customer.phone ?? ""} className={storeField} />
            </Field>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="acceptsMarketing" defaultChecked={customer.acceptsMarketing} className="size-4 accent-[var(--ink)]" />
              Send me offers and new launches
            </label>
          </ActionForm>
        </section>

        <section aria-labelledby="password-title">
          <h2 id="password-title" className="font-display text-3xl font-bold">
            Password
          </h2>
          <ActionForm action={changePassword} submitLabel="Change password" resetOnSuccess className="mt-6 space-y-4" buttonClassName={storeButton} tone="store">
            <Field label="Current password">
              <input name="current" type="password" required autoComplete="current-password" className={storeField} />
            </Field>
            <Field label="New password" hint="At least 8 characters.">
              <input name="password" type="password" required minLength={8} autoComplete="new-password" className={storeField} />
            </Field>
          </ActionForm>
        </section>
      </div>
    </StorePage>
  );
}
