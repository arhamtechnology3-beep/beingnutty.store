"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightLeft,
  BadgePercent,
  Boxes,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

const NAV = [
  {
    title: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/collections", label: "Collections", icon: LayoutGrid },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/redirects", label: "Redirects", icon: ArrowRightLeft },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminShell({
  admin,
  badges,
  children,
}: {
  admin: { name: string; email: string };
  badges: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {NAV.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{group.title}</p>
          {group.items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const badge = badges[href] ?? 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-caramel text-ink" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1">{label}</span>
                {badge > 0 ? (
                  <span className={cn("rounded-full px-2 text-xs font-bold", active ? "bg-ink text-paper" : "bg-caramel text-ink")}>{badge}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto space-y-1 pb-6 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10">
          <ExternalLink className="size-[18px]" />
          View store
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10">
            <LogOut className="size-[18px]" />
            Log out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display text-xl font-black text-paper">
            <Image src="/brand/mascot.png" alt="" width={642} height={700} className="h-8 w-auto" />
            <span>
              Being<span className="text-caramel">·</span>Nutty
            </span>
          </Link>
          <button type="button" className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        {nav}
      </aside>
      {open ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur md:px-8">
          <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight">{admin.name}</p>
              <p className="text-xs text-black/50">{admin.email}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-caramel font-bold text-ink">{admin.name[0]}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
