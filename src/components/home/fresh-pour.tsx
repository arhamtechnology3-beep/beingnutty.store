"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const CLIPS = [
  {
    src: "/videos/nuts-into-jar.mp4",
    poster: "/videos/nuts-into-jar.jpg",
    label: "Cashews, almonds and pistachios tumbling into a Being Nutty can",
  },
  {
    src: "/videos/nut-shower.mp4",
    poster: "/videos/nut-shower.jpg",
    label: "A shower of nuts falling around two Being Nutty cans",
  },
];

export function FreshPour() {
  return (
    <section aria-labelledby="fresh-pour-title" className="bg-ink py-24 text-paper md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-caramel">Straight into the can</p>
          <h2 id="fresh-pour-title" className="mt-4 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
            Whole nuts. <span className="italic text-caramel">Sealed fresh.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/80">
            Every Being Nutty can is a clear, resealable jar with an easy-peel foil seal under the lid — so you can see
            exactly what you&apos;re getting, and it stays crunchy after you open it.
          </p>
          <div className="relative mt-10 hidden aspect-[5/4] max-w-md overflow-hidden rounded-[2rem] lg:block">
            <Image
              src="/images/lifestyle/range-trio-bowls.jpg"
              alt="Being Nutty cashews, almonds and pistachios in bowls beside their cans"
              fill
              sizes="28rem"
              className="object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {CLIPS.map((clip, i) => (
            <LoopVideo key={clip.src} {...clip} className={i === 1 ? "mt-16 md:mt-24" : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LoopVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-roast ${className ?? ""}`}>
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}
