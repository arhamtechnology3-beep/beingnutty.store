import { ActionForm } from "@/components/action-form";
import { buttonClass, Card, Checkbox, EmptyRow, Field, inputClass, PageHeader, RowAction, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRedirect, deleteRedirect } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Redirects" };

export default async function RedirectsPage() {
  await requireAdmin();
  const redirects = await db.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="URL redirects" description="Send old or mistyped links to the right page so you keep search rankings." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <Table head={["From", "To", "Type", ""]}>
          {redirects.length === 0 ? <EmptyRow cols={4}>No redirects yet.</EmptyRow> : null}
          {redirects.map((r) => (
            <tr key={r.id}>
              <td className="px-5 py-3 font-mono text-xs">{r.from}</td>
              <td className="px-5 py-3 font-mono text-xs">{r.to}</td>
              <td className="px-5 py-3 text-black/60">{r.permanent ? "Permanent (308)" : "Temporary (307)"}</td>
              <td className="px-5 py-3 text-right">
                <RowAction action={deleteRedirect.bind(null, r.id)} label="Delete" variant="danger" />
              </td>
            </tr>
          ))}
        </Table>
        <Card>
          <h2 className="font-semibold">Add redirect</h2>
          <ActionForm action={createRedirect} submitLabel="Create redirect" resetOnSuccess className="mt-4 space-y-4" buttonClassName={`${buttonClass()} w-full`}>
            <Field label="Old path" hint="e.g. /products/cashew-250g">
              <input name="from" required className={inputClass} />
            </Field>
            <Field label="Redirect to" hint="A path like /products/kaju-cashews or a full URL.">
              <input name="to" required className={inputClass} />
            </Field>
            <Checkbox name="permanent" label="Permanent (recommended for SEO)" defaultChecked />
          </ActionForm>
          <p className="mt-4 text-xs text-black/50">Redirects only apply to paths that don&apos;t already exist on the store.</p>
        </Card>
      </div>
    </>
  );
}
