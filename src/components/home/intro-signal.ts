"use client";

import { useSyncExternalStore } from "react";
import { INTRO_STORAGE_KEY } from "./intro-boot";

const EVENT = "bn:intro-done";

function isDone() {
  return (
    document.documentElement.classList.contains("intro-seen") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function markIntroDone() {
  sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  document.documentElement.classList.add("intro-seen");
  window.dispatchEvent(new Event(EVENT));
}

/** True once the intro loader has finished (or was skipped). */
export function useIntroDone() {
  return useSyncExternalStore(subscribe, isDone, () => false);
}