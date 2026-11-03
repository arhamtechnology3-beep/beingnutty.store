import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field, StorePage, storeButton, storeField } from "@/components/store/fields";
import { getCustomer, safeNext } from "@/lib/customer-auth";
import { registerCustomer } from "../actions";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : null);
  if (await getCustomer()) redirect(target);

  return (
    <StorePage
      title="Create account"
      intro="Ordered before as a guest? Use the same email and mobile number and your past orders will appear in your account."
      width="max-w-md"
    >
      <ActionForm action={registerCustomer} submitLabel="Create account" pendingLabel="Creating…" className="space-y-5" buttonClassName={`${storeButton} w-full`} tone="store">
        <input type="hidden" name="next" value={target} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input name="firstName" required autoComplete="given-name" className={storeField} />
          </Field>
          <Field label="Last name">
            <input name="lastName" autoComplete="family-name" className={storeField} />
          </Field>
        </div>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={storeField} />
        </Field>
        <Field label="Mobile number">
          <input name="phone" type="tel" required inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" className={storeField} />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={storeField} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="acceptsMarketing" className="size-4 accent-[var(--ink)]" />
          Send me offers and new launches
        </label>
      </ActionForm>
      <p className="mt-8 text-center text-roast">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(target)}`} className="font-semibold text-ink underline">
          Sign in
        </Link>
      </p>
    </StorePage>
  );
}
