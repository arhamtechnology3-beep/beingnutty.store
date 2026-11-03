"use client";

import { useSyncExternalStore } from "react";

/** A tiny list persisted in localStorage and shared across tabs. */
export function createLocalList<T extends { slug: string }>(key: string, max: number) {
  const EMPTY: T[] = [];
  let items: T[] = EMPTY;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = EMPTY;
    }
  };

  const commit = (next: T[]) => {
    items = next.slice(0, max);
    localStorage.setItem(key, JSON.stringify(items));
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    load();
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      items = e.newValue ? JSON.parse(e.newValue) : EMPTY;
      listeners.forEach((l) => l());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const store = {
    has: (slug: string) => (load(), items.some((i) => i.slug === slug)),
    /** Adds to the front, replacing any existing entry for the same slug. */
    put(item: T) {
      load();
      commit([item, ...items.filter((i) => i.slug !== item.slug)]);
    },
    remove(slug: string) {
      load();
      commit(items.filter((i) => i.slug !== slug));
    },
    toggle(item: T) {
      if (store.has(item.slug)) store.remove(item.slug);
      else store.put(item);
    },
  };

  const useItems = () =>
    useSyncExternalStore(
      subscribe,
      () => (load(), items),
      () => EMPTY,
    );

  return { store, useItems };
}

export type SavedProduct = {
  slug: string;
  title: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  accentColor: string;
  variantId: string;
  variantTitle: string;
};

const wishlist = createLocalList<SavedProduct>("bn-wishlist-v1", 50);
export const wishlistStore = wishlist.store;
export const useWishlist = wishlist.useItems;

const recent = createLocalList<SavedProduct>("bn-recent-v1", 12);
export const recentStore = recent.store;
export const useRecentlyViewed = recent.useItems;
