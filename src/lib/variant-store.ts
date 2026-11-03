import { useSyncExternalStore } from "react";

/** Selected size per product, shared by the buy box and the gallery on a product page. */
let selected: Record<string, string> = {};
const listeners = new Set<() => void>();

export function selectVariant(slug: string, variantId: string) {
  if (selected[slug] === variantId) return;
  selected = { ...selected, [slug]: variantId };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSelectedVariant(slug: string, fallback: string) {
  return useSyncExternalStore(
    subscribe,
    () => selected[slug] ?? fallback,
    () => fallback,
  );
}
