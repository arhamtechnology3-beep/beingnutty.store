import Image from "next/image";
import { cn } from "@/lib/utils";

const CUTOUTS = {
  "kaju-cashews": { w: 640, h: 850, alt: "Can of Being Nutty whole cashews" },
  "badam-almonds": { w: 640, h: 891, alt: "Can of Being Nutty California almonds" },
  "pista-pistachios": { w: 640, h: 867, alt: "Can of Being Nutty pistachio kernels" },
  "roasted-kaju-cashews": { w: 640, h: 847, alt: "Can of Being Nutty smoked cashews" },
  "roasted-badam-almonds": { w: 640, h: 882, alt: "Can of Being Nutty smoked almonds" },
  "roasted-pista-pistachios": { w: 636, h: 900, alt: "Can of Being Nutty smoked pistachios" },
  "mix-dry-fruits": { w: 640, h: 861, alt: "Can of Being Nutty 3 Mix Nuts" },
  "roasted-mix-dry-fruits": { w: 640, h: 869, alt: "Can of Being Nutty smoked salted 3 Mix Nuts" },
} as const;

export type CanPhotoSlug = keyof typeof CUTOUTS;

export const cutoutSize = (slug: CanPhotoSlug) => ({ w: CUTOUTS[slug].w, h: CUTOUTS[slug].h });

/** Background-free can shot for a product, if one exists. */
export function cutoutFor(slug: string) {
  if (!(slug in CUTOUTS)) return null;
  const c = CUTOUTS[slug as CanPhotoSlug];
  return { src: `/images/cutouts/${slug}.webp`, alt: c.alt };
}

/** Background-free product shot of a can, for floating in animated layouts. */
export function CanPhoto({
  slug,
  className,
  preload,
  sizes = "(min-width: 768px) 300px, 60vw",
}: {
  slug: CanPhotoSlug;
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  const c = CUTOUTS[slug];
  return (
    <Image
      src={`/images/cutouts/${slug}.webp`}
      width={c.w}
      height={c.h}
      alt={c.alt}
      sizes={sizes}
      preload={preload}
      draggable={false}
      className={cn("h-auto w-full select-none drop-shadow-[0_30px_40px_rgba(42,26,16,0.35)]", className)}
    />
  );
}
