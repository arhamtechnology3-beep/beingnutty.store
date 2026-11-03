import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { NewsletterForm } from "./newsletter-form";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/collections/dry-fruits", label: "All dry fruits" },
      { href: "/collections/raw-nuts", label: "Raw nuts" },
      { href: "/collections/roasted-nuts", label: "Smoked nuts" },
      { href: "/collections/mixes", label: "Mixes" },
      { href: "/collections", label: "All collections" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/track-order", label: "Track your order" },
      { href: "/account", label: "My account" },
      { href: "/faq", label: "FAQ" },
      { href: "/pages/shipping-policy", label: "Shipping" },
      { href: "/pages/refund-policy", label: "Returns & refunds" },
      { href: "/pages/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/pages/about", label: "About us" },
      { href: "/blog", label: "Journal" },
      { href: "/pages/privacy-policy", label: "Privacy" },
      { href: "/pages/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="grain overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-20 md:px-10">
        <div className="grid gap-14 md:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="/" aria-label="Being Nutty — home" className="mb-10 grid size-28 place-items-center rounded-full bg-cream p-3">
              <Image src="/brand/logo.png" alt="Being Nutty logo" width={900} height={895} className="h-auto w-full" />
            </Link>
            <NewsletterForm />
            <address className="mt-8 flex flex-col gap-1 text-sm not-italic text-paper/70">
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-caramel">
                {site.email}
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-caramel">
                {site.phone}
              </a>
            </address>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-paper/85 transition-colors hover:text-caramel">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p
          aria-hidden
          className="mt-20 select-none whitespace-nowrap font-display text-[19vw] font-black leading-[0.8] tracking-tighter text-paper/[0.07] md:text-[17vw]"
        >
          Being Nutty
        </p>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-paper/15 pt-6 text-sm text-paper/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>
            FSSAI Lic. No. {site.fssaiLicence} · Manufactured &amp; marketed by {site.manufacturer}
          </p>
        </div>
      </div>
    </footer>
  );
}
