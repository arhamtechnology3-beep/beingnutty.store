"use client";

import { useEffect, useRef, type ComponentType, type SVGProps } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { CanPhoto, type CanPhotoSlug } from "@/components/visuals/can-photo";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

gsap.registerPlugin(ScrollTrigger);
// Mobile address bars resize the viewport while scrolling; re-measuring then makes pinned sections jump.
ScrollTrigger.config({ ignoreMobileResize: true });

type Chapter = {
  name: string;
  aka: string;
  copy: string;
  sizes: string;
  href: string;
  bg: string;
  fg: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  photo: CanPhotoSlug;
};

const CHAPTERS: Chapter[] = [
  {
    name: "Kaju",
    aka: "Cashews",
    copy: "Creamy, buttery and whole. For snacking, curries, pulao and every mithai box.",
    sizes: "250 g · 400 g · raw & smoked",
    href: "/products/kaju-cashews",
    bg: "#E9C987",
    fg: "#2a1a10",
    Icon: Cashew,
    photo: "kaju-cashews",
  },
  {
    name: "Badam",
    aka: "Almonds",
    copy: "The everyday handful. Soak overnight, toss into milk, or roast for crunch.",
    sizes: "250 g · 400 g · raw & smoked",
    href: "/products/badam-almonds",
    bg: "#B9773F",
    fg: "#fbf7ef",
    Icon: Almond,
    photo: "badam-almonds",
  },
  {
    name: "Pista",
    aka: "Pistachios",
    copy: "That signature green. Snack on them or crown your kheer and kulfi.",
    sizes: "200 g · 400 g · raw & smoked",
    href: "/products/pista-pistachios",
    bg: "#9DB24E",
    fg: "#1d2410",
    Icon: Pistachio,
    photo: "pista-pistachios",
  },
  {
    name: "Mix",
    aka: "3 Mix Nuts",
    copy: "Almonds, cashews and pistachios in one can — raw, or smoked and lightly salted.",
    sizes: "200 g · 400 g · raw & smoked",
    href: "/collections/mixes",
    bg: "#5A2618",
    fg: "#fbf7ef",
    Icon: Almond,
    photo: "mix-dry-fruits",
  },
];

export function NutStory() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
        const { desktop, motion } = context.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;
        const panels = gsap.utils.toArray<HTMLElement>("[data-chapter]");
        const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth;
        // Phones are narrow, so stretch the scroll a little to keep each panel on screen long enough to read.
        const length = desktop ? 1 : 1.6;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance() * length}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track.current, { x: () => -distance(), ease: "none" }, 0);

        panels.forEach((panel) => {
          gsap.fromTo(
            panel.querySelector("[data-chapter-can]"),
            { rotate: 18, y: desktop ? 80 : 40 },
            {
              rotate: -8,
              y: -20,
              ease: "none",
              scrollTrigger: { trigger: panel, containerAnimation: tl, start: "left right", end: "right left", scrub: true },
            },
          );
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // GSAP pinning re-parents the section into a pin-spacer; the wrapper keeps React's own parent node stable.
  return (
    <div>
      <section
        id="nut-story"
        ref={root}
        aria-labelledby="nut-story-title"
        className="relative overflow-hidden motion-safe:h-[100svh]"
      >
        <h2
          id="nut-story-title"
          className="absolute left-5 top-20 z-20 md:top-24 rounded-full bg-paper/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink md:left-10"
        >
          What&apos;s inside the can
        </h2>
        <div ref={track} className="flex flex-col motion-safe:h-full motion-safe:w-max motion-safe:flex-row">
          {CHAPTERS.map((c, i) => (
            <article
              key={c.name}
              data-chapter
              className="relative flex min-h-[100svh] w-full shrink-0 flex-col justify-center-safe gap-6 overflow-hidden px-5 pb-8 pt-32 max-md:[@media(max-height:700px)]:gap-4 max-md:[@media(max-height:700px)]:pt-28 motion-safe:h-full motion-safe:min-h-0 motion-safe:w-screen md:flex-row md:items-center md:gap-16 md:px-16 md:py-28"
              style={{ backgroundColor: c.bg, color: c.fg, ["--stroke" as string]: c.fg }}
            >
              <span aria-hidden className="text-outline pointer-events-none absolute -bottom-6 right-4 font-display text-[38vw] font-black leading-none opacity-20 md:text-[26vw]">
                0{i + 1}
              </span>
              <div className="relative z-10 max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-70">{c.aka}</p>
                <h3 className="mt-2 font-display text-[clamp(3.6rem,14vw,12rem)] font-black leading-[0.85] tracking-tight md:mt-3">{c.name}</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed max-md:[@media(max-height:700px)]:mt-3 max-md:[@media(max-height:700px)]:text-base md:mt-6 md:text-xl">{c.copy}</p>
                <p className="mt-3 text-sm font-medium opacity-75 max-md:[@media(max-height:700px)]:hidden md:mt-4">{c.sizes}</p>
                <a
                  href={c.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 font-semibold transition-colors hover:bg-current/10 md:mt-8 md:px-6 md:py-3"
                >
                  Shop {c.name}
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
              <div className="relative z-10 mx-auto w-[min(46vw,27svh,220px)] max-md:[@media(max-height:700px)]:w-[22svh] md:mx-0 md:ml-auto md:mr-[8vw] md:w-[min(60vw,280px)]">
                <c.Icon className="absolute -left-12 -top-6 w-16 animate-[bob_7s_ease-in-out_infinite] md:-left-16 md:-top-10 md:w-32" aria-hidden />
                <div data-chapter-can>
                  <CanPhoto slug={c.photo} sizes="(min-width: 768px) 280px, 46vw" />
                </div>
                <c.Icon className="absolute -bottom-4 -right-10 w-14 rotate-45 animate-[bob_5s_ease-in-out_infinite] md:-bottom-6 md:-right-14 md:w-24" aria-hidden />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
