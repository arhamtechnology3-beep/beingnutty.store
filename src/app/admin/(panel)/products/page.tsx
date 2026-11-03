import Link from "next/link";
import { EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin();
  const products = await db.product.findMany({
    include: { variants: true, images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageHeader title="Products" description={`${products.length} products`} action={{ href: "/admin/products/new", label: "Add product" }} />
      <Table head={["Product", "Status", "Inventory", "Variants", "Price"]}>
        {products.length === 0 ? <EmptyRow cols={5}>No products yet.</EmptyRow> : null}
        {products.map((p) => {
          const stock = p.variants.reduce((s, v) => s + v.inventoryQty, 0);
          const prices = p.variants.map((v) => v.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return (
            <tr key={p.id} className="hover:bg-black/[0.02]">
              <td className="px-5 py-3">
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                  <span className="size-10 shrink-0 rounded-lg" style={{ background: p.accentColor ?? "#ddd" }} aria-hidden />
                  {p.title}
                </Link>
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className={`px-5 py-3 tabular-nums ${stock <= 10 ? "font-semibold text-amber-700" : ""}`}>{stock} in stock</td>
              <td className="px-5 py-3">{p.variants.length}</td>
              <td className="px-5 py-3 tabular-nums">
                {prices.length ? (min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`) : "—"}
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
