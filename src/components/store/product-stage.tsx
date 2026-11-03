import Image from "next/image";
import { Can } from "@/components/visuals/can";
import { cutoutFor } from "@/components/visuals/can-photo";
import { cn } from "@/lib/utils";

/**
 * Product visual for cards: the background-free can standing on an accent-tinted stage, so every
 * card's can has the same size and baseline. Falls back to the first photo, then to an illustrated can.
 * Needs a `group` ancestor for the hover photo swap.
 */
export function ProductStage({
  slug,
  label,
  accentColor,
  image,
  hoverImage,
  sizes,
  preload,
  className,
}: {
  slug: string;
  label: string;
  accentColor: string;
  image: { url: string; alt: string } | null;
  hoverImage?: { url: string; alt: string } | null;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const cutout = cutoutFor(slug);
  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        background: `radial-gradient(130% 75% at 50% 100%, color-mix(in oklab, ${accentColor} 60%, var(--paper)) 0%, color-mix(in oklab, ${accentColor} 26%, var(--paper)) 55%, color-mix(in oklab, ${accentColor} 10%, var(--paper)) 100%)`,
      }}
    >
      {cutout ? (
        <>
          <span
            aria-hidden
            className="absolute inset-x-[24%] bottom-[6%] h-[7%] rounded-[50%] bg-ink/30 blur-md transition-transform duration-700 ease-out-expo group-hover:scale-x-90"
          />
          <div className="absolute inset-x-[10%] bottom-[8%] top-[19%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 group-hover:scale-[1.04]">
            <Image src={cutout.src} alt={cutout.alt} fill sizes={sizes} preload={preload} draggable={false} className="object-contain object-bottom" />
          </div>
        </>
      ) : image ? (
        <Image src={image.url} alt={image.alt} fill sizes={sizes} preload={preload} className="object-cover" />
      ) : (
        <div className="absolute inset-x-[24%] bottom-[8%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2">
          <Can label={label} color={accentColor} />
        </div>
      )}
      {hoverImage ? (
        <Image
          src={hoverImage.url}
          alt=""
          fill
          sizes={sizes}
          className="scale-105 object-cover opacity-0 transition duration-700 ease-out-expo group-hover:scale-100 group-hover:opacity-100"
        />
      ) : null}
    </div>
  );
}
