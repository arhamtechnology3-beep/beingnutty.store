import Link from "next/link";
import { IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { SalesChart } from "@/components/admin/sales-chart";
import { Card, EmptyRow, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

async function getDashboard(now: number) {
  const since = new Date(now - 30 * DAY);
  const counted = { createdAt: { gte: since }, status: { notIn: ["CANCELLED" as const, "PENDING" as const] } };

  const [agg, customers, recent, lowStock, daily] = await Promise.all([
    db.order.aggregate({ where: counted, _sum: { total: true }, _count: true }),
    db.customer.count({ where: { createdAt: { gte: since } } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.productVariant.findMany({
      where: { trackInventory: true, inventoryQty: { lte: 10 }, product: { status: "ACTIVE" } },
      include: { product: { select: { title: true, id: true } } },
      orderBy: { inventoryQty: "asc" },
      take: 6,
    }),
    db.order.findMany({ where: counted, select: { createdAt: true, total: true } }),
  ]);

  const revenue = agg._sum.total ?? 0;
  const orders = agg._count;

  const series = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(now - (29 - i) * DAY);
    const key = day.toISOString().slice(0, 10);
    const dayOrders = daily.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
    return {
      date: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0) / 100,
      orders: dayOrders.length,
    };
  });

  return { revenue, orders, customers, recent, lowStock, series };
}

export default async function DashboardPage() {
  await requireAdmin();
  const { revenue, orders, customers, recent, lowStock, series } = await getDashboard(new Date().getTime());

  const kpis = [
    { label: "Revenue (30d)", value: formatINR(revenue), icon: IndianRupee },
    { label: "Orders (30d)", value: String(orders), icon: ShoppingCart },
    { label: "Avg. order value", value: orders ? formatINR(Math.round(revenue / orders)) : "—", icon: Package },
    { label: "New customers (30d)", value: String(customers), icon: Users },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Last 30 days at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <span className="grid size-11 place-items-center rounded-xl bg-caramel/15 text-roast">
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-sm text-black/55">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="font-semibold">Sales</h2>
          <SalesChart data={series} />
        </Card>
        <Card>
          <h2 className="font-semibold">Low stock</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {lowStock.length === 0 ? <li className="py-6 text-sm text-black/50">All variants are well stocked.</li> : null}
            {lowStock.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                <Link href={`/admin/products/${v.product.id}`} className="hover:underline">
                  {v.product.title} <span className="text-black/50">· {v.title}</span>
                </Link>
                <span className={v.inventoryQty <= 0 ? "font-semibold text-red-700" : "font-semibold text-amber-700"}>{v.inventoryQty}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-roast hover:underline">
            View all
          </Link>
        </div>
        <Table head={["Order", "Date", "Customer", "Payment", "Status", "Total"]}>
          {recent.length === 0 ? <EmptyRow cols={6}>No orders yet.</EmptyRow> : null}
          {recent.map((o) => (
            <tr key={o.id} className="hover:bg-black/[0.02]">
              <td className="px-5 py-3 font-semibold">
                <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                  #{o.number}
                </Link>
              </td>
              <td className="px-5 py-3 text-black/60">{o.createdAt.toLocaleDateString("en-IN")}</td>
              <td className="px-5 py-3">{o.email}</td>
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
    </>
  );
}
