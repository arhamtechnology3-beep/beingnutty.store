import Link from "next/link";
import { EmptyRow, PageHeader, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatINR } from "@/lib/utils";
import { setInventory } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventory" };

const LOW_STOCK = 10;

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  await requireAdmin();
  const { low } = await searchParams;
  const onlyLow = low === "1";

  const variants = await db.productVariant.findMany({
    where: onlyLow ? { trackInventory: true, inventoryQty: { lte: LOW_STOCK } } : undefined,
    include: { product: { select: { id: true, title: true, status: true } } },
    orderBy: [{ product: { title: "asc" } }, { position: "asc" }],
  });

  return (
    <>
      <PageHeader title="Inventory" description="Stock on hand for every size. Orders reduce stock automatically." />
      <div className="mb-4 flex gap-2">
        {[
          { href: "/admin/inventory", label: "All", active: !onlyLow },
          { href: "/admin/inventory?low=1", label: `Low stock (≤ ${LOW_STOCK})`, active: onlyLow },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", f.active ? "bg-ink text-paper" : "bg-white ring-1 ring-black/10")}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <Table head={["Product", "Size", "SKU", "Price", "In stock"]}>
        {variants.length === 0 ? <EmptyRow cols={5}>Nothing here — stock looks healthy.</EmptyRow> : null}
        {variants.map((v) => (
          <tr key={v.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-3">
              <Link href={`/admin/products/${v.product.id}`} className="font-medium hover:underline">
                {v.product.title}
              </Link>
              {v.product.status !== "ACTIVE" ? <span className="ml-2 text-xs text-black/45">{v.product.status.toLowerCase()}</span> : null}
            </td>
            <td className="px-5 py-3">
              {v.title}
              {v.packaging ? <span className="block text-xs text-black/50">{v.packaging}</span> : null}
            </td>
            <td className="px-5 py-3 font-mono text-xs">{v.sku}</td>
            <td className="px-5 py-3 tabular-nums">{formatINR(v.price)}</td>
            <td className="px-5 py-3">
              {v.trackInventory ? (
                <form action={setInventory.bind(null, v.id)} className="flex items-center gap-2">
                  <input
                    name="qty"
                    type="number"
                    min={0}
                    defaultValue={v.inventoryQty}
                    aria-label={`Stock for ${v.product.title} ${v.title}`}
                    className={cn(
                      "w-24 rounded-lg border px-2.5 py-1.5 text-sm tabular-nums",
                      v.inventoryQty <= 0 ? "border-red-300 bg-red-50" : v.inventoryQty <= LOW_STOCK ? "border-amber-300 bg-amber-50" : "border-black/15",
                    )}
                  />
                  <button type="submit" className="rounded-md border border-black/15 px-2.5 py-1.5 text-xs font-semibold hover:bg-black/5">
                    Save
                  </button>
                </form>
              ) : (
                <span className="text-black/50">Not tracked</span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
