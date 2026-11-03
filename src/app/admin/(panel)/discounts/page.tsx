import { Card, EmptyRow, PageHeader, RowAction, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { deleteDiscount, toggleDiscount } from "./actions";
import { DiscountForm } from "./discount-form";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  await requireAdmin();
  const discounts = await db.discount.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="Discounts" description="Codes customers can enter at checkout." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <Table head={["Code", "Offer", "Minimum", "Used", "Ends", "Status", ""]}>
          {discounts.length === 0 ? <EmptyRow cols={7}>No discount codes yet.</EmptyRow> : null}
          {discounts.map((d) => (
            <tr key={d.id}>
              <td className="px-5 py-3 font-mono font-semibold">{d.code}</td>
              <td className="px-5 py-3">
                {d.type === "PERCENTAGE" ? `${d.value}% off` : d.type === "FIXED" ? `${formatINR(d.value)} off` : "Free shipping"}
              </td>
              <td className="px-5 py-3">{d.minSubtotal ? formatINR(d.minSubtotal) : "—"}</td>
              <td className="px-5 py-3 tabular-nums">
                {d.usedCount}
                {d.usageLimit ? ` / ${d.usageLimit}` : ""}
              </td>
              <td className="px-5 py-3 text-black/60">{d.endsAt ? d.endsAt.toLocaleDateString("en-IN") : "—"}</td>
              <td className="px-5 py-3">
                <form action={toggleDiscount.bind(null, d.id)}>
                  <button
                    type="submit"
                    className={d.active ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/50"}
                  >
                    {d.active ? "Active" : "Disabled"}
                  </button>
                </form>
              </td>
              <td className="px-5 py-3">
                <RowAction action={deleteDiscount.bind(null, d.id)} label="Delete" variant="danger" />
              </td>
            </tr>
          ))}
        </Table>
        <Card>
          <h2 className="font-semibold">Create discount</h2>
          <DiscountForm />
        </Card>
      </div>
    </>
  );
}
