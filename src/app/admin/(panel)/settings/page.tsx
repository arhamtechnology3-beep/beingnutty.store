import { ActionForm } from "@/components/action-form";
import { buttonClass, Card, Checkbox, Field, inputClass, PageHeader, RowAction } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getShippingSettings } from "@/lib/orders";
import { razorpayConfigured } from "@/lib/razorpay";
import { absoluteUrl } from "@/lib/site";
import { addStaff, changeAdminPassword, removeStaff, saveShipping } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await requireAdmin();
  const isOwner = me.role === "OWNER";
  const [shipping, staff] = await Promise.all([
    getShippingSettings(),
    db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, lastLoginAt: true } }),
  ]);

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Shipping &amp; payments</h2>
          {isOwner ? (
            <ActionForm action={saveShipping} submitLabel="Save" className="mt-4 space-y-4" buttonClassName={buttonClass()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Flat shipping rate (₹)">
                  <input name="flatRate" type="number" min={0} step="1" defaultValue={shipping.flatRate / 100} className={inputClass} />
                </Field>
                <Field label="Free shipping above (₹)" hint="Order subtotal after discounts.">
                  <input name="freeAbove" type="number" min={0} step="1" defaultValue={shipping.freeAbove / 100} className={inputClass} />
                </Field>
              </div>
              <Checkbox name="codEnabled" label="Offer cash on delivery" defaultChecked={shipping.codEnabled} />
              <div className="border-t border-black/10 pt-4">
                <p className="text-sm font-medium">Cart rewards</p>
                <p className="mt-1 text-xs text-black/50">
                  Shown as milestones in the cart and applied automatically at checkout. They don&apos;t stack with discount codes — the
                  bigger saving wins. Leave a row at 0 to switch it off.
                </p>
                {[1, 2, 3].map((i) => {
                  const t = shipping.rewards[i - 1];
                  return (
                    <div key={i} className="mt-3 grid grid-cols-2 gap-4">
                      <Field label={`Spend at least (₹)`}>
                        <input name={`rewardAt${i}`} type="number" min={0} step="1" defaultValue={t ? t.at / 100 : 0} className={inputClass} />
                      </Field>
                      <Field label="Discount (%)">
                        <input name={`rewardPercent${i}`} type="number" min={0} max={50} step="1" defaultValue={t?.percent ?? 0} className={inputClass} />
                      </Field>
                    </div>
                  );
                })}
              </div>
            </ActionForm>
          ) : (
            <p className="mt-3 text-sm text-black/60">Only the store owner can change shipping settings.</p>
          )}
          <div className="mt-6 rounded-xl bg-black/[0.03] p-4 text-sm">
            <p className="font-medium">Online payments (Razorpay): {razorpayConfigured() ? "connected" : "not connected"}</p>
            <p className="mt-1 text-black/60">
              Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_WEBHOOK_SECRET in your hosting environment. Webhook URL:{" "}
              <code className="break-all">{absoluteUrl("/api/webhooks/razorpay")}</code>
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Your password</h2>
          <ActionForm action={changeAdminPassword} submitLabel="Change password" resetOnSuccess className="mt-4 space-y-4" buttonClassName={buttonClass()}>
            <Field label="Current password">
              <input name="current" type="password" required autoComplete="current-password" className={inputClass} />
            </Field>
            <Field label="New password" hint="At least 10 characters.">
              <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="font-semibold">Staff accounts</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {staff.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-medium">{s.name}</span> <span className="text-black/55">· {s.email}</span>
                  <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold">{s.role.toLowerCase()}</span>
                </span>
                <span className="flex items-center gap-3 text-black/50">
                  {s.lastLoginAt ? `Last sign-in ${s.lastLoginAt.toLocaleDateString("en-IN")}` : "Never signed in"}
                  {isOwner && s.id !== me.id ? <RowAction action={removeStaff.bind(null, s.id)} label="Remove" variant="danger" /> : null}
                </span>
              </li>
            ))}
          </ul>
          {isOwner ? (
            <ActionForm
              action={addStaff}
              submitLabel="Add staff member"
              resetOnSuccess
              className="mt-6 grid gap-4 border-t border-black/10 pt-6 md:grid-cols-4"
              footerClassName="flex flex-wrap items-center gap-4 md:col-span-4"
              buttonClassName={buttonClass()}
            >
              <Field label="Name">
                <input name="name" required className={inputClass} />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required className={inputClass} />
              </Field>
              <Field label="Temporary password" hint="They can change it after signing in.">
                <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
              </Field>
              <Field label="Role" hint="Owners can manage settings and staff.">
                <select name="role" defaultValue="STAFF" className={inputClass}>
                  <option value="STAFF">Staff</option>
                  <option value="OWNER">Owner</option>
                </select>
              </Field>
            </ActionForm>
          ) : null}
        </Card>
      </div>
    </>
  );
}
