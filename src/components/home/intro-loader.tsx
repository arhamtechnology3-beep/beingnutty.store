"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { markIntroDone, useIntroDone } from "./intro-signal";

const WORD = "BEING NUTTY".split("");

export function IntroLoader() {
  const done = useIntroDone();
  const [leaving, setLeaving] = useState(false);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (done) return;
    const controls = animate(0, 100, {
      duration: 1.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, "0");
      },
      onComplete: () => setLeaving(true),
    });
    return () => controls.stop();
  }, [done]);

  if (done) return null;

  return (
    <motion.div
      data-intro
      aria-hidden
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink text-paper"
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      animate={leaving ? { clipPath: "inset(0 0 100% 0)" } : undefined}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => leaving && markIntroDone()}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 w-24 md:w-32"
      >
        <Image src="/brand/mascot.png" alt="" width={642} height={700} preload className="h-auto w-full animate-[bob_3s_ease-in-out_infinite]" />
      </motion.div>
      <div className="flex overflow-hidden font-display text-[12vw] font-black leading-none tracking-tight md:text-[8vw]">
        {WORD.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {ch === " " ? "\u00a0" : ch}
          </motion.span>
        ))}
      </div>
      <span ref={counter} className="mt-6 font-mono text-sm tracking-[0.3em] text-caramel">
        000
      </span>
    </motion.div>
  );
}
