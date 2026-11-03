import { AdminShell } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [pendingReviews, unreadMessages] = await Promise.all([
    db.review.count({ where: { approved: false } }),
    db.contactMessage.count({ where: { read: false } }),
  ]);
  return (
    <AdminShell admin={admin} badges={{ "/admin/reviews": pendingReviews, "/admin/messages": unreadMessages }}>
      {children}
    </AdminShell>
  );
}
