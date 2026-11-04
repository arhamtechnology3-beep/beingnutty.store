"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function fire(detail: { type: string; data: Record<string, unknown> }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("page_view_kp", { detail }));
  window.__KP_LOGIN_SDK_INSTANCE__?.logEvents?.(detail);
}

/** Generic page-view tracking for KwikEngage (product/collection get richer payloads from page components). */
export function KwikPassPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/products/") || pathname.startsWith("/collections/")) return;
    fire({ type: "other", data: {} });
  }, [pathname]);

  return null;
}

export function trackKwikPassProduct(data: {
  product_id: string;
  variant_id?: string;
  image_url: string;
  name: string;
  price: number;
  handle?: string;
}) {
  fire({ type: "product", data });
}

export function trackKwikPassCollection(data: {
  collection_id: string;
  name: string;
  image_url?: string;
  handle?: string;
}) {
  fire({ type: "collection", data });
}
