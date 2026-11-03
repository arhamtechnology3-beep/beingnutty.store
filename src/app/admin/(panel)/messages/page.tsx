import { Card, PageHeader, RowAction, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteMessage, setMessageRead } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  const messages = await db.contactMessage.findMany({ orderBy: [{ read: "asc" }, { createdAt: "desc" }], take: 200 });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader title="Messages" description={`From the contact form · ${unread} unread`} />
      {messages.length === 0 ? <Card className="text-center text-black/50">No messages yet.</Card> : null}
      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={m.read ? "opacity-70" : undefined}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.name} <span className="font-normal text-black/55">· {m.email}</span>
                  {m.phone ? <span className="font-normal text-black/55"> · {m.phone}</span> : null}
                </p>
                <p className="text-xs text-black/50">{m.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="flex items-center gap-2">
                {!m.read ? <StatusBadge status="UNREAD" /> : null}
                <a href={`mailto:${m.email}`} className="rounded-md border border-black/15 px-2.5 py-1 text-xs font-semibold hover:bg-black/5">
                  Reply
                </a>
                <RowAction action={setMessageRead.bind(null, m.id, !m.read)} label={m.read ? "Mark unread" : "Mark read"} />
                <RowAction action={deleteMessage.bind(null, m.id)} label="Delete" variant="danger" />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-black/75">{m.message}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
