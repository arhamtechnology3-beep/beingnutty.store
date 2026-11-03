"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Banknote, CreditCard, Truck } from "lucide-react";
import { CanPhoto } from "@/components/visuals/can-photo";

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    n: "01",
    title: "Packed in cans",
    copy: "Every Being Nutty product comes in a sturdy can — no crushed pouches, and it sits neatly on your kitchen shelf.",
    bg: "#2a1a10",
    fg: "#fbf7ef",
    visual: <CansVisual />,
  },
  {
    n: "02",
    title: "Raw or smoked",
    copy: "Whole nuts for cooking, soaking and sweets. Smoked ones for ready-to-eat, salty crunch. Your call.",
    bg: "#D08A3C",
    fg: "#2a1a10",
    visual: <RawSmokedVisual />,
  },
  {
    n: "03",
    title: "Sizes that fit",
    copy: "From 200–250 g cans for your desk to tall 400 g cans for the family.",
    bg: "#9DB24E",
    fg: "#1d2410",
    visual: <SizesVisual />,
  },
  {
    n: "04",
    title: "Delivered across India",
    copy: "Order online and pay with UPI, cards or net banking via Razorpay — or choose cash on delivery.",
    bg: "#fbf7ef",
    fg: "#2a1a10",
    visual: <DeliveryVisual />,
  },
];

export function WhyStack() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-why-card]");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          // Dim with an overlay rather than `filter`: filters on large sticky layers can paint as black boxes in Chrome.
          gsap
            .timeline({ scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true } })
            .to(card, { scale: 0.9 + i * 0.02, ease: "none" }, 0)
            .to(card.querySelector("[data-why-shade]"), { opacity: 0.3, ease: "none" }, 0);
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="why-title" className="mx-auto max-w-[1200px] px-5 pb-32 md:px-10">
      <h2 id="why-title" className="mb-14 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
        Why <span className="italic text-caramel">Being Nutty?</span>
      </h2>
      <div className="space-y-6">
        {REASONS.map((r, i) => (
          <article
            key={r.n}
            data-why-card
            className="sticky isolate grid origin-top gap-6 overflow-hidden rounded-[2rem] p-6 shadow-[0_-20px_60px_-30px_rgba(42,26,16,0.5)] will-change-transform sm:p-8 md:min-h-[60vh] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 md:rounded-[2.5rem] md:p-12 lg:p-14"
            style={{ top: `calc(6rem + ${i * 1.5}rem)`, backgroundColor: r.bg, color: r.fg }}
          >
            <div className="flex flex-col justify-between gap-6">
              <span className="font-display text-5xl font-black opacity-30 md:text-9xl">{r.n}</span>
              <div>
                <h3 className="font-display text-[2rem] font-black leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{r.title}</h3>
                <p className="mt-3 text-base leading-relaxed opacity-85 sm:text-lg md:mt-4 md:text-xl lg:text-2xl">{r.copy}</p>
              </div>
            </div>
            <div className="relative h-60 sm:h-72 md:h-auto md:min-h-[340px]">{r.visual}</div>
            <div data-why-shade aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
          </article>
        ))}
      </div>
    </section>
  );
}

function CansVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
      <Image
        src="/images/lifestyle/range-trio.jpg"
        alt="Being Nutty cashew, pistachio and almond cans with lids, beside bowls of each nut"
        fill
        sizes="(min-width: 768px) 45vw, 90vw"
        className="object-cover object-[50%_70%]"
      />
    </div>
  );
}

function RawSmokedVisual() {
  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-3 rounded-[1.5rem] bg-paper/25 p-4 md:rounded-[2rem] md:p-6">
      {(
        [
          ["kaju-cashews", "Raw"],
          ["roasted-kaju-cashews", "Smoked"],
        ] as const
      ).map(([slug, label]) => (
        <div key={slug} className="flex min-h-0 flex-col items-center justify-end gap-3">
          <div className="relative min-h-0 w-full flex-1">
            <CanPhoto slug={slug} sizes="(min-width: 768px) 20vw, 40vw" className="absolute inset-0 h-full object-contain object-bottom" />
          </div>
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-paper md:text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

function SizesVisual() {
  const sizes = [
    { src: "/images/products/kaju-cashews/front.jpg", grams: "200–250 g", can: "500 ml can", height: "h-[66%]" },
    { src: "/images/products/kaju-cashews/tall-can.jpg", grams: "400 g", can: "750 ml tall can", height: "h-full" },
  ];
  return (
    <div className="absolute inset-0 grid grid-cols-2 items-end gap-3 md:gap-4">
      {sizes.map((s) => (
        <figure key={s.grams} className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${s.height}`}>
          <Image src={s.src} alt={`${s.grams} Being Nutty ${s.can}`} fill sizes="(min-width: 768px) 22vw, 45vw" className="object-cover" />
          <figcaption className="absolute inset-x-2 bottom-2 rounded-xl bg-paper/90 px-2.5 py-1.5 text-ink md:rounded-2xl md:px-3 md:py-2 backdrop-blur md:inset-x-3 md:bottom-3">
            <span className="block font-display text-sm font-black leading-none md:text-xl">{s.grams}</span>
            <span className="mt-0.5 block text-[10px] font-semibold opacity-70 md:text-xs">{s.can}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function DeliveryVisual() {
  const chips = [
    { icon: Truck, label: "Ships across India" },
    { icon: CreditCard, label: "UPI · Cards · Net banking" },
    { icon: Banknote, label: "Cash on delivery" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-caramel/15 md:rounded-[2rem]">
      <div className="absolute bottom-[6%] right-[4%] top-[8%] w-[44%]">
        <CanPhoto slug="mix-dry-fruits" sizes="(min-width: 768px) 18vw, 40vw" className="absolute inset-0 h-full object-contain object-bottom" />
      </div>
      <ul className="absolute inset-y-0 left-0 flex flex-col justify-center gap-2.5 p-4 md:gap-3 md:p-6">
        {chips.map(({ icon: Icon, label }, i) => (
          <li
            key={label}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-paper py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(42,26,16,0.45)] md:py-2 md:pl-2 md:pr-4 md:text-sm"
            style={{ marginLeft: `${i % 2}rem` }}
          >
            <span className="grid size-6 place-items-center rounded-full bg-ink text-paper md:size-7">
              <Icon className="size-3.5 md:size-4" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
