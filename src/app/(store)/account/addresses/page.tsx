import { ActionForm } from "@/components/action-form";
import { Field, StorePage, storeButton, storeField } from "@/components/store/fields";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { INDIAN_STATES } from "@/lib/india";
import { AccountNav } from "../account-nav";
import { addAddress, deleteAddress, makeDefaultAddress } from "../actions";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const customer = await requireCustomer("/account/addresses");
  const addresses = await db.address.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <StorePage title="Addresses" width="max-w-5xl">
      <AccountNav current="/account/addresses" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="saved-title">
          <h2 id="saved-title" className="font-display text-3xl font-bold">
            Saved addresses
          </h2>
          {addresses.length === 0 ? <p className="mt-4 text-roast">No saved addresses yet.</p> : null}
          <ul className="mt-6 space-y-4">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-[1.5rem] bg-paper p-6">
                {a.isDefault ? <span className="mb-2 inline-block rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Default</span> : null}
                <address className="not-italic leading-relaxed">
                  <strong>{a.name}</strong>
                  <br />
                  {a.line1}
                  {a.line2 ? (
                    <>
                      <br />
                      {a.line2}
                    </>
                  ) : null}
                  <br />
                  {a.city}, {a.state} {a.pincode}
                  <br />
                  {a.phone}
                </address>
                <div className="mt-4 flex gap-4 text-sm font-semibold">
                  {!a.isDefault ? (
                    <form action={makeDefaultAddress.bind(null, a.id)}>
                      <button type="submit" className="underline">
                        Make default
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteAddress.bind(null, a.id)}>
                    <button type="submit" className="text-red-700 underline">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="new-address-title">
          <h2 id="new-address-title" className="font-display text-3xl font-bold">
            Add an address
          </h2>
          <ActionForm action={addAddress} submitLabel="Save address" resetOnSuccess className="mt-6 space-y-4" buttonClassName={storeButton} tone="store">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input name="name" required autoComplete="name" className={storeField} />
              </Field>
              <Field label="Mobile number">
                <input name="phone" type="tel" required inputMode="numeric" autoComplete="tel-national" className={storeField} />
              </Field>
            </div>
            <Field label="House / flat, street">
              <input name="line1" required autoComplete="address-line1" className={storeField} />
            </Field>
            <Field label="Area, landmark (optional)">
              <input name="line2" autoComplete="address-line2" className={storeField} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City">
                <input name="city" required autoComplete="address-level2" className={storeField} />
              </Field>
              <Field label="State">
                <select name="state" required defaultValue="" autoComplete="address-level1" className={storeField}>
                  <option value="" disabled>
                    Select
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pincode">
                <input name="pincode" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="postal-code" className={storeField} />
              </Field>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="isDefault" className="size-4 accent-[var(--ink)]" />
              Use as my default address
            </label>
          </ActionForm>
        </section>
      </div>
    </StorePage>
  );
}
