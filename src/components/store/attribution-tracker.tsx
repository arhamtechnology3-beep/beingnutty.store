"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttributionFromLocation, trackJourney } from "@/lib/attribution";

/** First-touch UTM/referrer + page/product path timeline for the order admin. */
export function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttributionFromLocation();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const product = pathname.match(/^\/products\/([^/?#]+)/);
    if (product) {
      trackJourney({ type: "product", path: pathname, productSlug: product[1] });
    } else {
      trackJourney({ type: "page", path: pathname });
    }
  }, [pathname]);

  return null;
}
