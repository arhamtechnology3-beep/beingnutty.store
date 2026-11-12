"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanPhoto } from "@/components/visuals/can-photo";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

gsap.registerPlugin(ScrollTrigger);

const SIDES = [
  {
    key: "raw",
    title: "Raw.",
    copy: "Whole nuts, as they are. For cooking, soaking overnight and your favourite mithai.",
    photo: "kaju-cashews" as const,
    href: "/collections/raw-nuts",
    cta: "Shop raw",
    panel: "bg-[#f3e8d4] text-ink",
  },
  {
    key: "roasted",
    title: "Smoked.",
    copy: "Roasted with a pinch of salt and a touch of olive oil for a smoky, savoury crunch. Ready to eat the moment you open the can.",
    photo: "roasted-kaju-cashews" as const,
    href: "/collections/roasted-nuts",
    cta: "Shop smoked",
    panel: "bg-[#140b08] text-paper",
  },
] as const;

function RawAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#f8f1e4_0%,#efe2c8_45%,#e4cfa0_100%)]" />
      <div className="absolute -left-[18%] top-[-28%] h-[72%] w-[72%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--caramel)_32%,transparent),transparent_68%)] motion-safe:animate-[raw-glow_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-22%] right-[-12%] h-[62%] w-[58%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,#ecd29b_50%,transparent),transparent_70%)] motion-safe:animate-[raw-glow_12s_ease-in-out_infinite_reverse]" />
      <Cashew className="absolute left-[6%] top-[18%] w-16 opacity-40 motion-safe:animate-[bob_7s_ease-in-out_infinite] md:w-24" />
      <Almond className="absolute right-[10%] top-[22%] w-12 opacity-35 motion-safe:animate-[bob_8s_ease-in-out_infinite_0.8s] md:w-20" />
      <Pistachio className="absolute bottom-[16%] left-[14%] w-14 opacity-32 motion-safe:animate-[bob_6.5s_ease-in-out_infinite_1.2s] md:w-20" />
      <Cashew className="absolute bottom-[22%] right-[18%] w-10 rotate-45 opacity-28 motion-safe:animate-[bob_9s_ease-in-out_infinite_0.4s] md:w-16" />
    </div>
  );
}

function CoalSmokeAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Solid fallback so Raw never shows through */}
      <div className="absolute inset-0 bg-[#0c0705]" />

      {/* Reference charcoal photo — coals + natural smoke */}
      <Image
        src="/images/atmosphere/coal-smoke.png"
        alt=""
        fill
        priority={false}
        sizes="100vw"
        className="object-cover object-[center_70%] scale-110 motion-safe:animate-[coal-breathe_14s_ease-in-out_infinite]"
      />

      {/* Extra drifting white smoke over the photo */}
      {[
        { left: "8%", delay: "0s", dur: "7s", w: "9rem", h: "75%" },
        { left: "26%", delay: "1.2s", dur: "8.4s", w: "11rem", h: "85%" },
        { left: "48%", delay: "0.5s", dur: "6.8s", w: "10rem", h: "72%" },
        { left: "68%", delay: "1.9s", dur: "9s", w: "12rem", h: "88%" },
        { left: "84%", delay: "0.8s", dur: "7.5s", w: "8rem", h: "70%" },
      ].map((p) => (
        <span
          key={p.left}
          className="absolute bottom-[6%] origin-bottom rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgb(255_255_255_/_0.42),rgb(210_205_198_/_0.18)_42%,transparent_70%)] blur-2xl mix-blend-screen motion-safe:[animation-name:smoke-rise] motion-safe:[animation-timing-function:ease-in] motion-safe:[animation-iteration-count:infinite]"
          style={
            {
              left: p.left,
              width: p.w,
              height: p.h,
              animationDuration: p.dur,
              animationDelay: p.delay,
            } satisfies CSSProperties
          }
        />
      ))}

      {/* Ember heat pulse along the coal bed */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(ellipse_at_bottom,#ff6a1a_0%,#a3380c_26%,transparent_70%)] opacity-45 mix-blend-screen motion-safe:animate-[ember-pulse_3.6s_ease-in-out_infinite]" />

      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute bottom-[14%] size-1.5 rounded-full bg-[#ffc06a] shadow-[0_0_14px_4px_#ff7a28] motion-safe:animate-[ember-float_4.8s_ease-out_infinite]"
          style={{ left: `${10 + i * 7}%`, animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* Keep “Smoked.” readable while letting coals show on the right */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_4_2_/_0.82)_0%,rgb(8_4_2_/_0.55)_34%,rgb(8_4_2_/_0.22)_58%,transparent_78%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgb(0_0_0_/_0.45)_100%)]" />
    </div>
  );
}

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
          // Fade Raw copy so titles never double-print through the wipe
          .to("[data-side='raw'] [data-copy]", { opacity: 0, ease: "none" }, 0)
          .to("[data-side='raw'] [data-can]", { rotate: -16, x: -64, opacity: 0.15, ease: "none" }, 0)
          .fromTo("[data-side='roasted'] [data-can]", { rotate: 18, x: 100 }, { rotate: -4, x: 0, ease: "none" }, 0);
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
            className={`absolute inset-0 isolate flex items-center overflow-hidden motion-reduce:relative ${side.panel} ${
              side.key === "roasted" ? "z-[2]" : "z-[1]"
            }`}
          >
            {side.key === "raw" ? <RawAtmosphere /> : <CoalSmokeAtmosphere />}
            <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-24 md:grid-cols-2 md:px-10">
              <div data-copy className={side.key === "roasted" ? "drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]" : undefined}>
                <p className="font-display text-[clamp(4rem,12vw,11rem)] font-black italic leading-[0.85] tracking-tight">
                  {side.title}
                </p>
                <p className="mt-6 max-w-md text-xl leading-relaxed opacity-85">{side.copy}</p>
                <a
                  href={side.href}
                  className="mt-8 inline-block rounded-full border border-current px-6 py-3 font-semibold transition-colors hover:bg-current/10"
                >
                  {side.cta}
                </a>
              </div>
              <div data-can className="relative mx-auto w-[min(55vw,260px)]">
                {side.key === "roasted" ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-[8%] -bottom-8 h-20 rounded-[100%] bg-[#ff7a28]/45 blur-2xl motion-safe:animate-[ember-pulse_3s_ease-in-out_infinite]"
                  />
                ) : null}
                <CanPhoto slug={side.photo} />
              </div>
            </div>
          </div>
        ))}
        <div
          data-divider
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-full z-20 w-px bg-caramel motion-reduce:hidden"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-caramel px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--caramel)_80%,transparent)]">
            Raw ⇄ Smoked
          </span>
        </div>
      </section>
    </div>
  );
}
