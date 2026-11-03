import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { buttonClass, Card, Checkbox, EmptyRow, Field, inputClass, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { updateCustomer } from "../actions";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      addresses: { orderBy: [{ isDefault: "desc" }, { id: "asc" }] },
    },
  });
  if (!customer) notFound();

  const counted = customer.orders.filter((o) => !["CANCELLED", "PENDING", "REFUNDED"].includes(o.status));
  const spent = counted.reduce((s, o) => s + o.total, 0);
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/customers" className="text-sm text-black/55 hover:underline">
          ← Customers
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-sm text-black/55">
          Customer since {customer.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
          {customer.passwordHash ? "Has an account" : "Guest / newsletter only"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Orders", value: String(counted.length) },
              { label: "Total spent", value: formatINR(spent) },
              { label: "Average order", value: counted.length ? formatINR(Math.round(spent / counted.length)) : "—" },
            ].map((k) => (
              <Card key={k.label}>
                <p className="text-sm text-black/55">{k.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{k.value}</p>
              </Card>
            ))}
          </div>

          <Table head={["Order", "Date", "Payment", "Status", "Total"]}>
            {customer.orders.length === 0 ? <EmptyRow cols={5}>No orders yet.</EmptyRow> : null}
            {customer.orders.map((o) => (
              <tr key={o.id} className="hover:bg-black/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className="px-5 py-3 text-black/60">{o.createdAt.toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-5 py-3 font-semibold tabular-nums">{formatINR(o.total)}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Contact</h2>
            <p className="mt-3 text-sm">
              <a href={`mailto:${customer.email}`} className="hover:underline">
                {customer.email}
              </a>
            </p>
            {customer.phone ? <p className="text-sm">{customer.phone}</p> : null}
          </Card>

          <Card>
            <h2 className="font-semibold">Addresses</h2>
            {customer.addresses.length === 0 ? <p className="mt-3 text-sm text-black/50">No saved addresses.</p> : null}
            <ul className="mt-3 space-y-3 text-sm">
              {customer.addresses.map((a) => (
                <li key={a.id}>
                  {a.isDefault ? <span className="text-xs font-semibold text-emerald-700">Default · </span> : null}
                  {a.name}, {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode} · {a.phone}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-semibold">Notes &amp; tags</h2>
            <ActionForm action={updateCustomer.bind(null, customer.id)} submitLabel="Save" className="mt-4 space-y-4" buttonClassName={buttonClass()}>
              <Checkbox name="acceptsMarketing" label="Subscribed to marketing" defaultChecked={customer.acceptsMarketing} />
              <Field label="Tags" hint="Comma separated, e.g. wholesale, vip">
                <input name="tags" defaultValue={customer.tags.join(", ")} className={inputClass} />
              </Field>
              <Field label="Internal note">
                <textarea name="note" rows={4} defaultValue={customer.note ?? ""} className={inputClass} />
              </Field>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
