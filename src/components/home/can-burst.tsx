"use client";

import type { ComponentType, SVGProps } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { CanPhoto, cutoutSize, type CanPhotoSlug } from "@/components/visuals/can-photo";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

/** The hero box is 640×880; photos sit at the bottom of it. */
const BOX = { w: 640, h: 880 };

/**
 * Where each photo's lid ends, as a fraction of the photo's height: at the can's sides and at the
 * front-centre (the lid's bottom edge curves down towards the camera). Measured from the cut-outs;
 * the mixes were shot from higher up, so more of the lid shows.
 */
const LIDS: Record<CanPhotoSlug, { side: number; front: number }> = {
  "kaju-cashews": { side: 0.088, front: 0.106 },
  "badam-almonds": { side: 0.095, front: 0.113 },
  "pista-pistachios": { side: 0.088, front: 0.104 },
  "roasted-kaju-cashews": { side: 0.084, front: 0.098 },
  "roasted-badam-almonds": { side: 0.092, front: 0.106 },
  "roasted-pista-pistachios": { side: 0.105, front: 0.123 },
  "mix-dry-fruits": { side: 0.16, front: 0.2 },
  "roasted-mix-dry-fruits": { side: 0.16, front: 0.205 },
};

/** The lid's bottom edge as points (x%, y%) across the hero box, left to right. */
function lidEdge(slug: CanPhotoSlug) {
  const { w, h } = cutoutSize(slug);
  const scaled = Math.min(BOX.h, (h * BOX.w) / w);
  const toBox = (f: number) => ((BOX.h - scaled + scaled * f) / BOX.h) * 100;
  const { side, front } = LIDS[slug];
  return Array.from({ length: 13 }, (_, i) => {
    const x = (i / 12) * 100;
    const u = (2 * i) / 12 - 1;
    return { x, y: toBox(side + (front - side) * Math.sqrt(1 - u * u)) };
  });
}

const polygon = (points: { x: number; y: number }[]) => `polygon(${points.map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(", ")})`;

type Nut = ComponentType<SVGProps<SVGSVGElement>>;

function nutsFor(slug: string): Nut[] {
  if (slug.includes("kaju")) return [Cashew];
  if (slug.includes("badam")) return [Almond];
  if (slug.includes("pista")) return [Pistachio];
  return [Cashew, Almond, Pistachio];
}

/**
 * A fountain of nuts: each flies from the can's mouth to a spot around the hero.
 * x/y are in vw/vh so the spread fills the screen at any size.
 */
const BURST = [
  { x: -38, y: -30, r: -220, s: 1.1 },
  { x: 34, y: -34, r: 260, s: 1.2 },
  { x: -18, y: -44, r: 140, s: 0.8 },
  { x: 16, y: -46, r: -180, s: 0.9 },
  { x: -44, y: 4, r: 300, s: 1.3 },
  { x: 42, y: 0, r: -280, s: 1.15 },
  { x: -4, y: -50, r: 200, s: 0.75 },
  { x: -28, y: -12, r: -160, s: 0.95 },
  { x: 26, y: -16, r: 190, s: 1 },
  { x: -36, y: 26, r: 240, s: 1.2 },
  { x: 36, y: 24, r: -240, s: 1.1 },
  { x: -12, y: -26, r: -120, s: 0.7 },
  { x: 10, y: -30, r: 130, s: 0.7 },
  { x: -46, y: -22, r: 170, s: 0.9 },
  { x: 46, y: -24, r: -170, s: 0.95 },
  { x: -22, y: 30, r: -200, s: 1 },
  { x: 22, y: 32, r: 210, s: 1.05 },
  { x: 2, y: -38, r: -260, s: 0.85 },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A can that opens as `open` goes 0 → 1: the lid pops off and flies away (0.05–0.4),
 * then the nuts inside burst out in a fountain (0.15–0.95).
 */
export function OpeningCan({ slug, open, preload }: { slug: CanPhotoSlug; open: MotionValue<number>; preload?: boolean }) {
  const edge = lidEdge(slug);
  const side = edge[0].y;
  const front = edge[6].y;
  // Body overlaps the lid by a hair so no gap shows before it lifts.
  const bodyClip = polygon([...edge.map((p) => ({ x: p.x, y: p.y - 0.4 })), { x: 100, y: 100 }, { x: 0, y: 100 }]);
  const lidClip = polygon([{ x: 0, y: 0 }, { x: 100, y: 0 }, ...[...edge].reverse()]);
  const lidY = useTransform(open, [0, 0.05, 0.12, 0.4], ["0%", "-4%", "-14%", "-120%"]);
  const lidX = useTransform(open, [0, 0.12, 0.4], ["0%", "6%", "70%"]);
  const lidRotate = useTransform(open, [0, 0.05, 0.12, 0.4], [0, -6, 18, 80]);
  const shake = useTransform(open, [0, 0.02, 0.04, 0.06, 0.08, 0.1], [0, -2.5, 2.5, -2, 1.5, 0]);
  const nuts = nutsFor(slug);
  const smoked = slug.startsWith("roasted");
  // The shadow sits outside the clip so the lid/body seam doesn't cut a hard line through it.
  const photo = (clip: string) => (
    <div className="absolute inset-0 drop-shadow-[0_30px_40px_rgba(42,26,16,0.35)]">
      <div className="absolute inset-0" style={{ clipPath: clip }}>
        <CanPhoto
          slug={slug}
          preload={preload}
          sizes="(min-width: 768px) 260px, 45vw"
          className="absolute inset-0 h-full object-contain object-bottom drop-shadow-none"
        />
      </div>
    </div>
  );

  return (
    <motion.div className="absolute inset-0" style={{ rotate: shake }}>
      <div aria-hidden className="absolute inset-x-0" style={{ top: `${(side + front) / 2}%` }}>
        {BURST.map((b, i) => (
          <BurstNut key={i} index={i} spec={b} open={open} Icon={nuts[i % nuts.length]} smoked={smoked} />
        ))}
      </div>
      {photo(bodyClip)}
      <motion.div
        className="absolute inset-0"
        style={{ x: lidX, y: lidY, rotate: lidRotate, transformOrigin: `90% ${side}%` }}
      >
        {photo(lidClip)}
      </motion.div>
    </motion.div>
  );
}

function BurstNut({
  index,
  spec,
  open,
  Icon,
  smoked,
}: {
  index: number;
  spec: (typeof BURST)[number];
  open: MotionValue<number>;
  Icon: Nut;
  smoked: boolean;
}) {
  const start = 0.15 + (index % 9) * 0.035 + Math.floor(index / 9) * 0.02;
  const t = useTransform(open, (v) => clamp((v - start) / 0.5));
  // Rises out of the can, arcs, and settles at its spot.
  const x = useTransform(t, (v) => `${spec.x * easeOut(v)}vw`);
  const y = useTransform(t, (v) => `${spec.y * easeOut(v) - 14 * Math.sin(Math.PI * v) - 4 * (1 - v) * Math.min(1, v * 8)}vh`);
  const rotate = useTransform(t, (v) => spec.r * easeOut(v));
  const scale = useTransform(t, (v) => 0.35 + (spec.s - 0.35) * easeOut(v));
  const opacity = useTransform(t, (v) => Math.min(1, v * 10));

  return (
    <motion.div
      className="absolute left-[33%] top-0 w-[34%] -translate-y-1/2"
      style={{ x, y, rotate, scale, opacity, filter: smoked ? "sepia(0.45) saturate(1.25) brightness(0.72)" : undefined }}
    >
      <Icon className="w-full drop-shadow-[0_10px_14px_rgba(42,26,16,0.3)]" />
    </motion.div>
  );
}
