import Image from "next/image";
import Link from "next/link";
import {
  Backpack,
  Briefcase,
  CakeSlice,
  CookingPot,
  Croissant,
  Droplets,
  Eye,
  Gift,
  Lock,
  Milk,
  PartyPopper,
  Popcorn,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { APlusContent, APlusUse } from "@/lib/aplus";
import { cn, formatINR } from "@/lib/utils";

const USE_ICONS: Record<APlusUse, LucideIcon> = {
  snack: Popcorn,
  soak: Droplets,
  cook: CookingPot,
  sweets: CakeSlice,
  garnish: Sparkles,
  bake: Croissant,
  breakfast: Sunrise,
  milk: Milk,
  gift: Gift,
  travel: Backpack,
  party: PartyPopper,
  work: Briefcase,
};

const CAN_FEATURES = [
  { Icon: Eye, title: "Clear body", text: "See exactly what you're buying before you open it." },
  { Icon: ShieldCheck, title: "Easy-peel foil seal", text: "Sealed under the lid until you're ready to snack." },
  { Icon: Lock, title: "Resealable lid", text: "Snap it shut after every handful to keep the crunch." },
  { Icon: Ruler, title: "Short & tall cans", text: "200–250 g in the short 500 ml can, 400 g in the tall 750 ml can." },
];

export type RangeRow = {
  slug: string;
  title: string;
  image: string | null;
  kind: string;
  taste: string;
  bestFor: string;
  sizes: string;
  from: number;
};

export function APlus({
  name,
  content,
  facts,
  accentColor,
  range,
  currentSlug,
}: {
  name: string;
  content: APlusContent;
  facts: { key: string; q: string; a: string }[];
  accentColor: string;
  range: RangeRow[];
  currentSlug: string;
}) {
  return (
    <section aria-labelledby="aplus-title" className="mt-20 space-y-6 md:mt-28 md:space-y-8">
      <div className="grid overflow-hidden rounded-[2rem] bg-ink text-paper md:grid-cols-2 md:rounded-[2.5rem]">
        <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[600px]">
          <Image
            src={content.hero.src}
            alt={content.hero.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 p-7 sm:p-10 lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-caramel">From the brand</p>
          <h2 id="aplus-title" className="font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            {content.headline}
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-paper/80">{content.intro}</p>
          <dl className="grid gap-4 border-t border-paper/15 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">Taste</dt>
              <dd className="mt-1">{content.taste}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">Best for</dt>
              <dd className="mt-1">{content.bestFor}</dd>
            </div>
          </dl>
        </div>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.features.map((f, i) => (
          <li
            key={f.title}
            className={cn("overflow-hidden rounded-[2rem] bg-paper", i === 2 && "sm:col-span-2 lg:col-span-1")}
          >
            <div className={cn("relative aspect-[4/3]", i === 2 && "sm:aspect-[16/9] lg:aspect-[4/3]")}>
              <Image
                src={f.image.src}
                alt={f.image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-roast">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="rounded-[2rem] p-7 sm:p-10 md:rounded-[2.5rem] lg:p-14"
        style={{ background: `color-mix(in oklab, ${accentColor} 35%, var(--paper))` }}
      >
        <h3 className="font-display text-3xl font-black tracking-tight md:text-5xl">Ways to enjoy {name}</h3>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.uses.map(({ use, title, text }) => {
            const Icon = USE_ICONS[use];
            return (
              <li key={title} className="rounded-3xl bg-cream/80 p-6">
                <Icon className="size-8 text-roast" aria-hidden />
                <p className="mt-4 font-display text-xl font-bold">{title}</p>
                <p className="mt-1 text-roast">{text}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-8 rounded-[2rem] border border-line p-7 sm:p-10 md:grid-cols-[1fr_2fr] md:rounded-[2.5rem] lg:p-14">
        <div>
          <h3 className="font-display text-3xl font-black tracking-tight md:text-5xl">
            {name} <span className="italic text-caramel">at a glance</span>
          </h3>
          <p className="mt-4 text-roast">Quick answers, straight from the label.</p>
        </div>
        <dl className="divide-y divide-line">
          {facts.map((f) => (
            <div key={f.key} className="py-4 first:pt-0 last:pb-0">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 leading-relaxed text-roast">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid overflow-hidden rounded-[2rem] bg-paper md:grid-cols-[2fr_3fr] md:rounded-[2.5rem]">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[460px]">
          <Image
            src="/images/lifestyle/range-tall.jpg"
            alt="Tall Being Nutty cans of almonds, cashews and pistachios with bowls in front"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="p-7 sm:p-10 lg:p-14">
          <h3 className="font-display text-3xl font-black tracking-tight md:text-5xl">The Being Nutty can</h3>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {CAN_FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-roast">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {range.length > 1 ? <CompareRange rows={range} currentSlug={currentSlug} /> : null}
    </section>
  );
}

function CompareRange({ rows, currentSlug }: { rows: RangeRow[]; currentSlug: string }) {
  const lines: { label: string; render: (r: RangeRow) => React.ReactNode }[] = [
    { label: "Type", render: (r) => r.kind },
    { label: "Taste", render: (r) => r.taste },
    { label: "Best for", render: (r) => r.bestFor },
    { label: "Sizes", render: (r) => r.sizes },
    { label: "Price from", render: (r) => <span className="font-semibold text-ink">{formatINR(r.from)}</span> },
  ];

  const ordered = [...rows.filter((r) => r.slug === currentSlug), ...rows.filter((r) => r.slug !== currentSlug)];

  return (
    <div className="rounded-[2rem] border border-line py-7 sm:py-10 md:rounded-[2.5rem] lg:py-14">
      <div className="px-5 sm:px-10 lg:px-14">
        <h3 className="font-display text-3xl font-black tracking-tight md:text-5xl">Compare the range</h3>
        <p className="mt-2 text-roast md:hidden">Swipe sideways to compare every can.</p>
      </div>

      <div
        className="mt-6 overflow-x-auto overscroll-x-contain md:mt-10"
        tabIndex={0}
        role="region"
        aria-label="Compare Being Nutty products"
      >
        <table
          className="w-full min-w-[calc(var(--cols)*8.5rem+7.25rem)] table-fixed border-separate border-spacing-0 text-left text-sm md:min-w-[980px]"
          style={{ "--cols": rows.length } as React.CSSProperties}
        >
          <caption className="sr-only">How Being Nutty products compare by type, taste, best uses, sizes and price</caption>
          <colgroup>
            <col className="w-24 sm:w-32 md:w-36 lg:w-44" />
            {ordered.map((r) => (
              <col key={r.slug} />
            ))}
            <col className="w-5 sm:w-10 md:w-7 lg:w-11" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-cream" />
              {ordered.map((r) => (
                <th
                  key={r.slug}
                  scope="col"
                  className={cn("px-2 pb-4 pt-3 align-top font-normal md:px-3", r.slug === currentSlug && "rounded-t-2xl bg-paper")}
                >
                  <Link href={`/products/${r.slug}`} className="group block">
                    <span className="relative mb-3 block aspect-square w-full overflow-hidden rounded-xl bg-paper md:aspect-[4/5]">
                      {r.image ? (
                        <Image src={r.image} alt="" fill sizes="140px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : null}
                    </span>
                    <span className="block font-display text-sm font-bold leading-tight group-hover:underline md:text-base">{r.title}</span>
                    {r.slug === currentSlug ? (
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-caramel">You&apos;re viewing</span>
                    ) : null}
                  </Link>
                </th>
              ))}
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, li) => (
              <tr key={line.label}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-t border-line bg-cream py-3 pl-5 pr-2 align-top text-[11px] font-semibold uppercase tracking-[0.12em] text-roast sm:pl-10 md:pr-3 md:text-xs md:tracking-[0.15em] lg:pl-14"
                >
                  {line.label}
                </th>
                {ordered.map((r) => (
                  <td
                    key={r.slug}
                    className={cn(
                      "border-t border-line px-2 py-3 align-top text-[13px] text-roast md:px-3 md:text-sm",
                      r.slug === currentSlug && "bg-paper",
                      r.slug === currentSlug && li === lines.length - 1 && "rounded-b-2xl",
                    )}
                  >
                    {line.render(r)}
                  </td>
                ))}
                <td aria-hidden className="border-t border-line" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
