import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-black/55">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={buttonClass()}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-black/10 bg-white p-5 md:p-6", className)}>{children}</div>;
}

export function buttonClass(variant: "primary" | "secondary" | "danger" = "primary") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
    variant === "primary" && "bg-ink text-paper hover:bg-roast",
    variant === "secondary" && "border border-black/15 bg-white hover:bg-black/5",
    variant === "danger" && "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  );
}

export const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-caramel/30";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-black/50">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--ink)]" />
      {label}
    </label>
  );
}

/** Small inline button that runs a bound server action, e.g. approve / delete in a table row. */
export function RowAction({
  action,
  label,
  variant = "secondary",
}: {
  action: () => Promise<void>;
  label: string;
  variant?: "secondary" | "danger";
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-semibold",
          variant === "danger" ? "text-red-700 hover:bg-red-50" : "border border-black/15 hover:bg-black/5",
        )}
      >
        {label}
      </button>
    </form>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  gray: "bg-black/5 text-black/60 ring-black/10",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  ACTIVE: "green",
  DRAFT: "gray",
  ARCHIVED: "gray",
  PAID: "green",
  PENDING: "amber",
  FAILED: "red",
  REFUNDED: "gray",
  CONFIRMED: "blue",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
  PUBLISHED: "green",
  HIDDEN: "gray",
  APPROVED: "green",
  UNREAD: "amber",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", TONES[STATUS_TONE[status] ?? "gray"])}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase tracking-wider text-black/50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-12 text-center text-black/50">
        {children}
      </td>
    </tr>
  );
}
