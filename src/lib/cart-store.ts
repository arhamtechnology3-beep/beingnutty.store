"use client";

import { useSyncExternalStore } from "react";
import { trackJourney } from "@/lib/attribution";

export type CartLine = {
  variantId: string;
  quantity: number;
  slug: string;
  title: string;
  variantTitle: string;
  price: number;
  accentColor: string;
  image?: string | null;
};

const KEY = "bn-cart-v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let open = false;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(parsed)) lines = parsed;
  } catch {
    lines = EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartLine[]) {
  lines = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    lines = e.newValue ? JSON.parse(e.newValue) : EMPTY;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const cart = {
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    load();
    const existing = lines.find((l) => l.variantId === line.variantId);
    commit(
      existing
        ? lines.map((l) => (l.variantId === line.variantId ? { ...l, ...line, quantity: Math.min(l.quantity + quantity, 20) } : l))
        : [...lines, { ...line, quantity }],
    );
    trackJourney({
      type: "add_to_cart",
      productSlug: line.slug,
      productTitle: line.title,
      variantTitle: line.variantTitle,
    });
    open = true;
    emit();
  },
  setQuantity(variantId: string, quantity: number) {
    commit(
      quantity <= 0
        ? lines.filter((l) => l.variantId !== variantId)
        : lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(quantity, 20) } : l)),
    );
  },
  /** Swap a line to another size of the same product, merging if that size is already in the cart. */
  swapVariant(fromId: string, to: { variantId: string; variantTitle: string; price: number }) {
    const line = lines.find((l) => l.variantId === fromId);
    if (!line) return;
    const existing = lines.find((l) => l.variantId === to.variantId);
    commit(
      existing
        ? lines
            .filter((l) => l.variantId !== fromId)
            .map((l) => (l.variantId === to.variantId ? { ...l, quantity: Math.min(l.quantity + line.quantity, 20) } : l))
        : lines.map((l) => (l.variantId === fromId ? { ...l, ...to } : l)),
    );
  },
  /** Back-fills photos for lines saved before images were stored. */
  fillImages(imageBySlug: Record<string, string | null>) {
    load();
    if (!lines.some((l) => !l.image && imageBySlug[l.slug])) return;
    commit(lines.map((l) => (l.image || !imageBySlug[l.slug] ? l : { ...l, image: imageBySlug[l.slug] })));
  },
  remove(variantId: string) {
    commit(lines.filter((l) => l.variantId !== variantId));
  },
  clear() {
    commit(EMPTY);
  },
  setOpen(value: boolean) {
    open = value;
    emit();
  },
};

export function useCartLines() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return lines;
    },
    () => EMPTY,
  );
}

export function useCartOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}

export function cartTotals(items: CartLine[]) {
  return {
    count: items.reduce((n, l) => n + l.quantity, 0),
    subtotal: items.reduce((n, l) => n + l.quantity * l.price, 0),
  };
}
