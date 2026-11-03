import Image from "next/image";
import { cn } from "@/lib/utils";

/** Square product thumbnail for cart, checkout and saved lists; falls back to the product colour. */
export function LineThumb({
  image,
  accentColor,
  className,
  sizes = "96px",
}: {
  image?: string | null;
  accentColor: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-2xl", className)}
      style={{ background: `color-mix(in oklab, ${accentColor} 45%, var(--paper))` }}
      aria-hidden
    >
      {image ? <Image src={image} alt="" fill sizes={sizes} className="object-cover" /> : null}
    </div>
  );
}
