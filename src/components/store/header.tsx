"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BadgePercent,
  Banknote,
  Heart,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { cart, cartTotals, useCartLines } from "@/lib/cart-store";
import { useWishlist } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-overlay";

const NAV = [
  { href: "/collections/dry-fruits", label: "Shop all" },
  { href: "/collections/raw-nuts", label: "Raw" },
  { href: "/collections/roasted-nuts", label: "Smoked" },
  { href: "/blog", label: "Journal" },
  { href: "/faq", label: "FAQ" },
];

const iconButton = "grid size-11 place-items-center rounded-full transition-colors hover:bg-ink/[0.06]";

export function Header({ announcements }: { announcements: string[] }) {
  const pathname = usePathname();
  const lines = useCartLines();
  const { count } = cartTotals(lines);
  const saved = useWishlist().length;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
        scrolled || menuOpen ? "bg-cream/80 shadow-[0_1px_0_var(--line)] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <AnnouncementBar messages={announcements} hidden={scrolled || menuOpen} />
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-2xl font-black tracking-tight md:text-[1.7rem]"
          aria-label="Being Nutty — home"
        >
          <Image
            src="/brand/mascot.png"
            alt=""
            width={642}
            height={700}
            preload
            className="h-10 w-auto transition-transform duration-500 group-hover:-rotate-12 md:h-12"
          />
          <span>
            Being<span className="text-caramel">·</span>Nutty
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 whitespace-nowrap lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-sm font-medium tracking-wide after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out-expo hover:after:origin-left hover:after:scale-x-100",
                pathname === item.href && "after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button type="button" onClick={() => setSearchOpen(true)} className={iconButton} aria-label="Search (press /)">
            <Search className="size-5" />
          </button>
          <Link
            href="/wishlist"
            className={cn(iconButton, "relative hidden sm:grid")}
            aria-label={`Wishlist, ${saved} saved`}
          >
            <Heart className="size-5" />
            {saved > 0 ? (
              <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-caramel text-[10px] font-bold text-ink">
                {saved}
              </span>
            ) : null}
          </Link>
          <Link href="/account" className={cn(iconButton, "hidden sm:grid")} aria-label="My account">
            <User className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => cart.setOpen(true)}
            className="relative grid size-11 place-items-center rounded-full bg-ink text-paper transition-transform hover:scale-105"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-caramel text-[11px] font-bold text-ink">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-full border border-line lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav aria-label="Mobile" className="border-t border-line px-5 pb-8 pt-4 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 font-display text-3xl font-bold"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="mt-4 block border-t border-line pt-5 text-lg font-semibold">
            Wishlist{saved ? ` (${saved})` : ""}
          </Link>
          <Link href="/account" onClick={() => setMenuOpen(false)} className="block py-2 text-lg font-semibold">
            My account
          </Link>
          <Link href="/track-order" onClick={() => setMenuOpen(false)} className="block py-2 text-lg font-semibold">
            Track your order
          </Link>
        </nav>
      ) : null}
      {searchOpen ? <SearchOverlay onClose={closeSearch} /> : null}
    </header>
  );
}

const ANNOUNCEMENT_ICONS: [RegExp, LucideIcon][] = [
  [/cash on delivery|\bcod\b/i, Banknote],
  [/save|reward|% off/i, BadgePercent],
  [/deliver|shipping/i, Truck],
  [/fresh|pack|cans?\b/i, PackageCheck],
];

const iconFor = (message: string) => ANNOUNCEMENT_ICONS.find(([re]) => re.test(message))?.[1] ?? Sparkles;

function AnnouncementBar({ messages, hidden }: { messages: string[]; hidden: boolean }) {
  if (!messages.length) return null;
  // Repeated so one copy is wider than any screen; the track holds two copies and slides by half for a seamless loop.
  const run = [...messages, ...messages];
  const group = (copy: number) => (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {run.map((m, i) => {
        const Icon = iconFor(m);
        return (
          <li key={`${copy}-${i}`} className="flex shrink-0 items-center gap-2 px-6 md:px-8">
            <Icon className="size-3.5 shrink-0 text-caramel" aria-hidden />
            <span className="whitespace-nowrap">{m}</span>
            <Sparkles className="ml-6 size-3 shrink-0 text-paper/35 md:ml-8" aria-hidden />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className={cn(
        "grid bg-ink text-paper transition-[grid-template-rows] duration-500",
        hidden ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
      )}
      aria-hidden={hidden}
    >
      <div className="group/marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div
          className="flex h-8 w-max items-center text-xs font-medium tracking-wide animate-[marquee_45s_linear_infinite] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none md:text-[13px]"
          style={{ animationDuration: `${run.length * 6}s` }}
        >
          {group(0)}
          {group(1)}
        </div>
        <p className="sr-only">{messages.join(". ")}</p>
      </div>
    </div>
  );
}
