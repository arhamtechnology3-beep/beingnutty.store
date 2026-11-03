"use client";

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { HardLink } from "@/components/store/hard-link";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CanPhoto, type CanPhotoSlug } from "@/components/visuals/can-photo";
import { cn, formatINR } from "@/lib/utils";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";
import { OpeningCan } from "./can-burst";
import { useIntroDone } from "./intro-signal";

gsap.registerPlugin(ScrollTrigger);

type FloatingNut = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  className: string;
  depth: number;
  fly: { x: number; y: number; rotate: number };
  delay: number;
};

const NUTS: FloatingNut[] = [
  { Icon: Cashew, className: "left-[6%] top-[18%] w-20 md:w-32", depth: 40, fly: { x: -220, y: -160, rotate: -120 }, delay: 0 },
  { Icon: Almond, className: "right-[8%] top-[14%] w-16 md:w-24", depth: 28, fly: { x: 240, y: -200, rotate: 140 }, delay: 0.6 },
  { Icon: Pistachio, className: "left-[12%] bottom-[16%] w-16 md:w-28", depth: 55, fly: { x: -260, y: 220, rotate: 90 }, delay: 1.1 },
  { Icon: Cashew, className: "right-[10%] bottom-[20%] w-12 md:w-20", depth: 34, fly: { x: 260, y: 180, rotate: -80 }, delay: 0.3 },
  { Icon: Cashew, className: "right-[30%] top-[8%] hidden w-14 md:block", depth: 18, fly: { x: 120, y: -260, rotate: 200 }, delay: 1.4 },
  { Icon: Almond, className: "left-[30%] bottom-[8%] hidden w-12 md:block", depth: 22, fly: { x: -140, y: 260, rotate: -160 }, delay: 0.9 },
];

const ease = [0.16, 1, 0.3, 1] as const;
const ROTATE_EVERY = 4200;

/**
 * dir 1 = the new can rolls in from the right, pushing the old one out to the left; -1 the reverse.
 * Both share one timing so they stay 70vw apart and never overlap. One full turn over that distance
 * roughly matches a can's circumference, so it reads as rolling rather than spinning.
 */
const rollTiming = { duration: 1.5, ease: [0.65, 0, 0.35, 1] } as const;
const ROLL: Variants = {
  enter: (dir: number) => ({ x: `${dir * 70}vw`, rotate: dir * 360 }),
  center: { x: 0, rotate: 0, transition: rollTiming },
  exit: (dir: number) => ({ x: `${dir * -70}vw`, rotate: dir * -360, transition: rollTiming }),
};

const FADE: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export type HeroCan = { slug: CanPhotoSlug; name: string; accentColor: string; from: number };

const FALLBACK: HeroCan[] = [{ slug: "kaju-cashews", name: "Kaju", accentColor: "#d08a3c", from: 0 }];

export function Hero({ cans: list }: { cans: HeroCan[] }) {
  const root = useRef<HTMLElement>(null);
  const ready = useIntroDone();
  const reduceMotion = useReducedMotion();
  const cans = list.length ? list : FALLBACK;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [opened, setOpened] = useState(false);
  const open = useMotionValue(0);
  const current = cans[index % cans.length];

  // Start on a different can each visit. Picked after hydration (the can is hidden until the intro ends).
  useEffect(() => {
    const id = requestAnimationFrame(() => setIndex(Math.floor(Math.random() * cans.length)));
    return () => cancelAnimationFrame(id);
  }, [cans.length]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!ready || reduceMotion || hovered || opened || !inView || !tabVisible || cans.length < 2) return;
    // Alternate sides so cans arrive from the right, then the left, and so on.
    const id = setTimeout(() => {
      setDir((d) => -d);
      setIndex((i) => (i + 1) % cans.length);
    }, ROTATE_EVERY);
    return () => clearTimeout(id);
  }, [ready, reduceMotion, hovered, opened, inView, tabVisible, index, cans.length]);

  const show = (i: number) => {
    if (i === index % cans.length) return;
    setDir(i > index % cans.length ? 1 : -1);
    setIndex(i);
  };

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // A nudge of scroll plays the whole opening (so the can never sits half-open), and the hero
        // stays pinned while it plays. Back at the top, the lid goes back on.
        let isOpen = false;
        let playing: ReturnType<typeof animate> | undefined;
        const setOpen = (next: boolean) => {
          if (next === isOpen) return;
          isOpen = next;
          setOpened(next);
          playing?.stop();
          playing = animate(open, next ? 1 : 0, { duration: next ? 2.4 : 0.9, ease: "linear" });
        };
        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=90%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => setOpen(self.progress > 0.01),
          },
        });
        tl.to("[data-hero-can]", { scale: 1.12, rotate: 6, duration: 0.4 }, 0)
          .to("[data-hero-line='1']", { xPercent: -18 }, 0)
          .to("[data-hero-line='2']", { xPercent: 14 }, 0)
          // Explicit start values: this is built before the intro fades the copy in, so `.to` would
          // record it as hidden and scrolling back up would leave it invisible.
          .fromTo("[data-hero-copy]", { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.3, immediateRender: false }, 0);
        gsap.utils.toArray<HTMLElement>("[data-hero-nut]").forEach((el, i) => {
          const { x, y, rotate } = NUTS[i].fly;
          tl.to(el, { x, y, rotate, opacity: 0.2, ease: "none" }, 0);
        });
      });
    }, root);
    return () => ctx.revert();
  }, [open]);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-28"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={false}
        animate={{ background: `radial-gradient(60% 50% at 50% 45%, ${hexToRgba(current.accentColor, 0.38)} 0%, rgba(0, 0, 0, 0) 70%)` }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {NUTS.map((nut, i) => (
        <div key={i} data-hero-nut className={`pointer-events-none absolute ${nut.className}`}>
          <ParallaxLayer x={sx} y={sy} depth={nut.depth}>
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={ready ? { opacity: 1, scale: 1 } : undefined}
              transition={{ delay: 0.5 + i * 0.08, duration: 1, ease }}
            >
              <nut.Icon className="w-full animate-[bob_6s_ease-in-out_infinite]" style={{ animationDelay: `${nut.delay}s` }} />
            </motion.div>
          </ParallaxLayer>
        </div>
      ))}

      <h1 id="hero-title" className="relative z-0 text-center font-display font-black leading-[0.82] tracking-[-0.04em]">
        <span className="sr-only">Being Nutty — premium dry fruits packed in cans. </span>
        <span data-hero-line="1" className="block overflow-hidden pb-[0.06em] text-[clamp(3.6rem,13vw,13.5rem)]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={ready ? { y: 0 } : undefined}
            transition={{ duration: 1.1, ease }}
          >
            Go a little
          </motion.span>
        </span>
        <span data-hero-line="2" className="block overflow-hidden pb-[0.08em] text-[clamp(4.2rem,16vw,16.5rem)] italic text-roast">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={ready ? { y: 0 } : undefined}
            transition={{ duration: 1.1, delay: 0.12, ease }}
          >
            nutty.
          </motion.span>
        </span>
      </h1>

      <div className="relative z-10 -mt-[6vw] w-[clamp(130px,17vw,250px)] md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-[72%] lg:-translate-y-[42%]">
        <div data-hero-can>
        <ParallaxLayer x={sx} y={sy} depth={-14}>
          <motion.div
            initial={{ y: 120, opacity: 0, rotate: 12 }}
            animate={ready ? { y: 0, opacity: 1, rotate: -6 } : undefined}
            transition={{ delay: 0.3, duration: 1.3, ease }}
          >
            <div
              className="relative aspect-[640/880]"
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              {/* Keeps every can's image loaded so the next one rolls in without a blank frame. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
                {cans.map((c) =>
                  c.slug === current.slug ? null : (
                    <CanPhoto key={c.slug} slug={c.slug} sizes="(min-width: 768px) 260px, 45vw" className="absolute inset-0 h-full object-contain" />
                  ),
                )}
              </div>
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={current.slug}
                  custom={dir}
                  variants={reduceMotion ? FADE : ROLL}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <OpeningCan slug={current.slug} open={open} preload />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </ParallaxLayer>
        </div>
      </div>

      {current.from ? (
        <motion.div
          data-hero-copy
          className="relative z-20 mt-6 flex max-w-full flex-col items-center gap-3 md:order-last md:mt-10 lg:absolute lg:bottom-10 lg:left-12 lg:mt-0 lg:items-start"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.9, duration: 1, ease }}
        >
          <HardLink
            href={`/products/${current.slug}`}
            className="group inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full bg-paper/80 py-1.5 pl-1.5 pr-4 text-sm font-semibold shadow-[0_8px_24px_-14px_rgba(42,26,16,0.5)] ring-1 ring-line backdrop-blur transition-colors hover:bg-paper"
            aria-live="polite"
          >
            <motion.span
              aria-hidden
              className="size-6 shrink-0 rounded-full"
              initial={false}
              animate={{ backgroundColor: current.accentColor }}
              transition={{ duration: 0.6 }}
            />
            <span className="hidden text-roast sm:inline">Now showing</span>
            <span className="truncate">{current.name}</span>
            <span className="shrink-0 text-roast">· from {formatINR(current.from)}</span>
            <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </HardLink>
          {cans.length > 1 ? (
            <div className="flex items-center gap-1.5 lg:pl-2" role="group" aria-label="Choose a can">
              {cans.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`Show ${c.name}`}
                  aria-pressed={i === index % cans.length}
                  className="grid h-6 place-items-center px-0.5"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500",
                      i === index % cans.length ? "w-6 bg-ink" : "w-1.5 bg-ink/25 hover:bg-ink/50",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      ) : null}

      <motion.div
        data-hero-copy
        className="relative z-20 mt-8 flex max-w-xl flex-col items-center text-center md:mt-28"
        initial={{ opacity: 0, y: 24 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.7, duration: 1, ease }}
      >
        <p className="text-balance text-lg text-roast md:text-xl">
          Premium kaju, badam, pista and nut mixes — raw or smoked, packed in cans and delivered across India.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <HardLink
            href="/collections/dry-fruits"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-paper transition-colors hover:bg-roast"
          >
            Shop the range
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </HardLink>
          <a href="#nut-story" className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-7 py-4 font-semibold transition-colors hover:bg-ink/5">
            What&apos;s inside
          </a>
        </div>
      </motion.div>

      <RotatingBadge />

      <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 text-roast/70">
        <ArrowDown className="size-5 animate-bounce" />
      </div>
    </section>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function ParallaxLayer({
  x,
  y,
  depth,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  children: React.ReactNode;
}) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return <motion.div style={{ x: tx, y: ty }}>{children}</motion.div>;
}

function RotatingBadge() {
  return (
    <div aria-hidden className="absolute bottom-10 right-6 hidden size-32 md:block lg:right-12 lg:size-36">
      <svg viewBox="0 0 100 100" className="size-full animate-[spin-slow_18s_linear_infinite]">
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fontSize="9.5" letterSpacing="2.4" fill="var(--ink)" fontWeight="600">
          <textPath href="#badge-circle">PACKED IN CANS • RAW & SMOKED • </textPath>
        </text>
      </svg>
      <Pistachio className="absolute left-1/2 top-1/2 w-10 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
