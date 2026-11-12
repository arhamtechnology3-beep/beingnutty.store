"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { HomeCollection } from "./collections-grid";

const TONES = ["#e9c987", "#c8945a", "#9db24e", "#d08a3c", "#5a2618", "#b9773f"];

/** Horizontal sliding collection cards — drag / arrows / autoplay. */
export function CollectionsSlider({ collections }: { collections: HomeCollection[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const sync = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  };

  const slide = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide-card]");
    const step = (card?.offsetWidth ?? 280) + 16;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [collections.length]);

  useEffect(() => {
    if (paused || collections.length < 2) return;
    const id = window.setInterval(() => {
      const el = scroller.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 12) el.scrollTo({ left: 0, behavior: "smooth" });
      else slide(1);
    }, 3800);
    return () => window.clearInterval(id);
  }, [paused, collections.length]);

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mb-5 flex items-center justify-end gap-2 px-5 md:px-10">
        <button
          type="button"
          onClick={() => slide(-1)}
          disabled={!canPrev}
          aria-label="Previous collections"
          className="grid size-11 place-items-center rounded-full border border-line bg-paper text-ink transition enabled:hover:border-ink disabled:opacity-35"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => slide(1)}
          disabled={!canNext}
          aria-label="Next collections"
          className="grid size-11 place-items-center rounded-full border border-line bg-paper text-ink transition enabled:hover:border-ink disabled:opacity-35"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      <ul
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:gap-5 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {collections.map((c, i) => {
          const tone = TONES[i % TONES.length];
          const dark = Boolean(c.image) || i % TONES.length === 4;
          const names = c.productNames.slice(0, 4);
          const extra = Math.max(0, c.productCount - names.length);
          return (
            <li key={c.id} data-slide-card className="w-[min(78vw,20.5rem)] shrink-0 snap-start md:w-[22rem]">
              <Link
                href={`/collections/${c.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--ink)_55%,transparent)] transition duration-500 hover:-translate-y-1.5"
                style={{ background: tone, color: dark ? "var(--paper)" : "var(--ink)" }}
              >
                {c.image ? (
                  <>
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 22rem, 78vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
                    />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/10" />
                  </>
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-40 motion-safe:animate-[raw-glow_10s_ease-in-out_infinite]"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, color-mix(in oklab, white 35%, transparent), transparent 55%)`,
                    }}
                  />
                )}

                {c.featured ? (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-paper/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                    Featured
                  </span>
                ) : null}

                <ArrowUpRight className="absolute right-5 top-5 z-10 size-6 opacity-85 transition-transform duration-500 group-hover:rotate-45" aria-hidden />

                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-75">
                    {c.productCount} product{c.productCount === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-display text-[1.55rem] font-black leading-[0.95] tracking-tight md:text-[1.75rem]">
                    {c.title}
                  </h3>

                  {names.length ? (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {names.map((name) => (
                        <li
                          key={name}
                          className="rounded-full bg-paper/18 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm"
                        >
                          {name}
                        </li>
                      ))}
                      {extra > 0 ? (
                        <li className="rounded-full bg-paper/18 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                          +{extra} more
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed opacity-85">
                      {c.description ?? "Open the matching Being Nutty cans for this search."}
                    </p>
                  )}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Shop collection
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
