"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { LineThumb } from "./line-thumb";

type Result = { slug: string; title: string; name: string; image: string | null; accentColor: string; price: number };

const SUGGESTIONS = ["Kaju", "Badam", "Pista", "Smoked", "3 Mix", "Raw"];

/** Mount only while open so each visit starts fresh. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setResults((await res.json()).results);
      } catch {
        return;
      }
      setLoading(false);
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const go = (q: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const q = query.trim();

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search products" data-lenis-prevent>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-0 max-h-dvh w-full max-w-2xl overflow-y-auto bg-paper p-5 shadow-2xl sm:mt-20 sm:rounded-[2rem] sm:p-7">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q) go(q);
          }}
          className="flex items-center gap-3 rounded-full border-2 border-ink px-4"
        >
          <Search className="size-5 shrink-0 text-roast" aria-hidden />
          <label htmlFor="search-overlay" className="sr-only">
            Search products
          </label>
          <input
            ref={input}
            id="search-overlay"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) {
                setResults(null);
                setLoading(false);
              }
            }}
            placeholder="Search kaju, badam, smoked…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-lg focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {loading ? <Loader2 className="size-5 shrink-0 animate-spin text-roast" aria-hidden /> : null}
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-cream" aria-label="Close search">
            <X className="size-5" />
          </button>
        </form>

        {!q ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-roast">Popular</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results ? (
          <div className="mt-5" aria-live="polite">
            {results.length ? (
              <ul className="divide-y divide-line">
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/products/${r.slug}`} onClick={onClose} className="group flex items-center gap-4 py-3">
                      <LineThumb image={r.image} accentColor={r.accentColor} sizes="56px" className="size-14 rounded-xl" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold group-hover:underline">{r.title}</span>
                        <span className="text-sm text-roast">from {formatINR(r.price)}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-roast transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-roast">No products match “{q}”. Try kaju, badam, pista or smoked.</p>
            )}
            <button type="button" onClick={() => go(q)} className="mt-4 text-sm font-semibold underline underline-offset-4">
              See all results for “{q}”
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
