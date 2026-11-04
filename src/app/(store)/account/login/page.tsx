import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { KwikPassFormsButton } from "@/components/kwikpass/kwikpass-forms-button";
import { KwikPassLogin } from "@/components/kwikpass/kwikpass-login";
import { Field, StorePage, storeButton, storeField } from "@/components/store/fields";
import { getCustomer, safeNext } from "@/lib/customer-auth";
import { kwikpassEnabled } from "@/lib/kwikpass-config";
import { loginCustomer } from "../actions";

export const metadata = { title: "Sign in" };

export default async function CustomerLoginPage({ searchParams }: PageProps<"/account/login">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : null);
  if (await getCustomer()) redirect(target);
  const kp = kwikpassEnabled();

  return (
    <StorePage title="Sign in" intro="Track orders, save addresses and check out faster." width="max-w-md">
      {kp ? (
        <div className="space-y-8">
          <KwikPassLogin next={target} />
          <KwikPassFormsButton
            label="Open KwikForms"
            className="w-full rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink/5"
          />
          <div className="relative text-center text-sm text-roast">
            <span className="bg-cream px-3 relative z-10">or email &amp; password</span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden />
          </div>
        </div>
      ) : null}
      <ActionForm action={loginCustomer} submitLabel="Sign in" pendingLabel="Signing in…" className="mt-6 space-y-5" buttonClassName={`${storeButton} w-full`} tone="store">
        <input type="hidden" name="next" value={target} />
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={storeField} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" className={storeField} />
        </Field>
      </ActionForm>
      <p className="mt-8 text-center text-roast">
        New to Being Nutty?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(target)}`} className="font-semibold text-ink underline">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-roast">
        Forgot your password?{" "}
        <Link href="/pages/contact" className="underline">
          Contact us
        </Link>{" "}
        and we&apos;ll help you reset it.
      </p>
    </StorePage>
  );
}
