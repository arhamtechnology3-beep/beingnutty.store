"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imagesForVariant } from "@/lib/variant-images";
import { useSelectedVariant } from "@/lib/variant-store";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; alt: string; variantId: string | null };
type GalleryVariant = { id: string; title: string; packaging: string | null };

export function ProductGallery({
  slug,
  images,
  variants,
  defaultVariantId,
  accentColor,
}: {
  slug: string;
  images: GalleryImage[];
  variants: GalleryVariant[];
  defaultVariantId: string;
  accentColor: string;
}) {
  const variantId = useSelectedVariant(slug, defaultVariantId);
  const list = imagesForVariant(images, variantId);
  const [pick, setPick] = useState({ variantId, index: 0 });
  const active = pick.variantId === variantId ? Math.min(pick.index, list.length - 1) : 0;
  const current = list[active];
  const variant = variants.find((v) => v.id === variantId);
  const showsVariant = current?.variantId === variantId && variants.length > 1;

  const go = (index: number) => setPick({ variantId, index: (index + list.length) % list.length });

  const touchX = useRef<number | null>(null);

  return (
    <div data-gallery className="flex min-w-0 flex-col gap-3 lg:grid lg:grid-cols-[88px_1fr] lg:gap-4">
      <div
        className="group relative order-1 aspect-[4/5] touch-pan-y overflow-hidden rounded-[2rem] lg:order-2 lg:rounded-[2.5rem]"
        style={{ background: `color-mix(in oklab, ${accentColor} 40%, var(--paper))` }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {list.map((img, i) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt}
            fill
            preload={i === 0}
            sizes="(min-width: 1024px) 45vw, 100vw"
            aria-hidden={i !== active}
            className={cn("object-cover transition-opacity duration-500", i === active ? "opacity-100" : "opacity-0")}
          />
        ))}

        {showsVariant && variant ? (
          <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold backdrop-blur">
            {variant.title}
            {variant.packaging ? ` · ${variant.packaging}` : ""}
          </span>
        ) : null}

        {list.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-md backdrop-blur transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-md backdrop-blur transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-paper">
              {active + 1} / {list.length}
            </span>
          </>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {current?.alt}
        </span>
      </div>

      {list.length > 1 ? (
        <div className="relative order-2 lg:order-1">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] lg:absolute lg:inset-0 lg:mx-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:px-1">
            {list.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                aria-pressed={i === active}
                className={cn(
                  "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-cream transition sm:w-20 lg:w-full",
                  i === active ? "ring-2 ring-ink" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="88px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
