import Link from "next/link";
import { LogoutButton } from "@/components/kwikpass/logout-button";

const LINKS = [
  { href: "/account", label: "Orders & profile" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav({ current }: { current: string }) {
  return (
    <nav aria-label="Account" className="flex flex-wrap items-center gap-2">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.href === current ? "page" : undefined}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
        >
          {l.label}
        </Link>
      ))}
      <LogoutButton className="ml-auto text-sm font-semibold text-roast underline" />
    </nav>
  );
}
