import { AdminShell } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";
import { buildSafe } from "@/lib/build-safe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [pendingReviews, unreadMessages] = await Promise.all([
    buildSafe(() => db.review.count({ where: { approved: false } }), 0),
    buildSafe(() => db.contactMessage.count({ where: { read: false } }), 0),
  ]);
  return (
    <AdminShell admin={admin} badges={{ "/admin/reviews": pendingReviews, "/admin/messages": unreadMessages }}>
      {children}
    </AdminShell>
  );
}
