"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanPhoto } from "@/components/visuals/can-photo";

gsap.registerPlugin(ScrollTrigger);

const SIDES = [
  {
    key: "raw",
    title: "Raw.",
    copy: "Whole nuts, as they are. For cooking, soaking overnight and your favourite mithai.",
    photo: "kaju-cashews",
    href: "/collections/raw-nuts",
    cta: "Shop raw",
    className: "bg-cream text-ink",
  },
  {
    key: "roasted",
    title: "Smoked.",
    copy: "Roasted with a pinch of salt and a touch of olive oil for a smoky, savoury crunch. Ready to eat the moment you open the can.",
    photo: "roasted-kaju-cashews",
    href: "/collections/roasted-nuts",
    cta: "Shop smoked",
    className: "bg-[#3b2416] text-paper",
  },
] as const;

export function RawVsRoasted() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-side='roasted']", { clipPath: "inset(0 0 0 100%)" });
        gsap.set("[data-divider]", { left: "100%" });
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=120%", pin: true, scrub: 0.6 },
          })
          .to("[data-side='roasted']", { clipPath: "inset(0 0 0 0%)", ease: "none" }, 0)
          .to("[data-divider]", { left: "0%", ease: "none" }, 0)
          .to("[data-side='raw'] [data-can]", { rotate: -20, x: -80, ease: "none" }, 0)
          .fromTo("[data-side='roasted'] [data-can]", { rotate: 20, x: 120 }, { rotate: -4, x: 0, ease: "none" }, 0);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // GSAP pinning re-parents the section into a pin-spacer; the wrapper keeps React's own parent node stable.
  return (
    <div>
      <section
        ref={root}
        aria-labelledby="raw-roasted-title"
        className="relative h-[100svh] overflow-hidden motion-reduce:h-auto"
      >
        <h2 id="raw-roasted-title" className="sr-only">
          Raw or smoked dry fruits
        </h2>
        {SIDES.map((side) => (
          <div
            key={side.key}
            data-side={side.key}
            className={`absolute inset-0 flex items-center motion-reduce:relative ${side.className}`}
          >
            <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-24 md:grid-cols-2 md:px-10">
              <div>
                <p className="font-display text-[clamp(4rem,12vw,11rem)] font-black italic leading-[0.85] tracking-tight">{side.title}</p>
                <p className="mt-6 max-w-md text-xl leading-relaxed opacity-85">{side.copy}</p>
                <a
                  href={side.href}
                  className="mt-8 inline-block rounded-full border border-current px-6 py-3 font-semibold transition-colors hover:bg-current/10"
                >
                  {side.cta}
                </a>
              </div>
              <div data-can className="mx-auto w-[min(55vw,260px)]">
                <CanPhoto slug={side.photo} />
              </div>
            </div>
          </div>
        ))}
        <div
          data-divider
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-full z-10 w-px bg-caramel motion-reduce:hidden"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-caramel px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink">
            Raw ⇄ Smoked
          </span>
        </div>
      </section>
    </div>
  );
}
