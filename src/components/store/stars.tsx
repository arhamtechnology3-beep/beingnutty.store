import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five stars, filled to the nearest tenth (4.6 fills four and most of the fifth). */
export function Stars({ rating, className, starClassName }: { rating: number; className?: string; starClassName?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, rating - n + 1));
        return (
          <span key={n} className="relative inline-flex">
            <Star className={cn("size-4 fill-line text-line", starClassName)} aria-hidden />
            {fill > 0 ? (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.round(fill * 100)}%` }}>
                <Star className={cn("size-4 fill-caramel text-caramel", starClassName)} aria-hidden />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
