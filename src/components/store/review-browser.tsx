"use client";

import { useState } from "react";
import { BadgeCheck, MessageSquareQuote, PenLine, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stars } from "./stars";

export type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  location: string | null;
  size: string | null;
  verified: boolean;
  reply: string | null;
  time: number;
  date: string;
};

const SORTS = {
  recent: { label: "Most recent", fn: (a: ReviewItem, b: ReviewItem) => b.time - a.time },
  high: { label: "Highest rated", fn: (a: ReviewItem, b: ReviewItem) => b.rating - a.rating || b.time - a.time },
  low: { label: "Lowest rated", fn: (a: ReviewItem, b: ReviewItem) => a.rating - b.rating || b.time - a.time },
} as const;

const AVATAR_TONES = ["#d08a3c", "#7d9440", "#a0522d", "#6b4f3a", "#b8892b", "#5f7f6a"];
const PAGE = 6;

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

function tone(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function ReviewBrowser({ productName, reviews, form }: { productName: string; reviews: ReviewItem[]; form: React.ReactNode }) {
  const [writing, setWriting] = useState(reviews.length === 0);
  const [stars, setStars] = useState<number | null>(null);
  const [sort, setSort] = useState<keyof typeof SORTS>("recent");
  const [shown, setShown] = useState(PAGE);

  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const byStar = [5, 4, 3, 2, 1].map((n) => ({ n, total: reviews.filter((r) => r.rating === n).length }));
  const happy = count ? Math.round((reviews.filter((r) => r.rating >= 4).length / count) * 100) : 0;
  const list = reviews.filter((r) => !stars || r.rating === stars).sort(SORTS[sort].fn);

  const writeButton = (
    <button
      type="button"
      onClick={() => setWriting((w) => !w)}
      aria-expanded={writing}
      aria-controls="write-review"
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition hover:bg-roast"
    >
      {writing ? <X className="size-4" aria-hidden /> : <PenLine className="size-4" aria-hidden />}
      {writing ? "Close" : "Write a review"}
    </button>
  );

  const formPanel = writing ? (
    <div id="write-review" className="rounded-[2rem] bg-paper p-6 ring-1 ring-line md:p-8">
      <h3 className="font-display text-2xl font-bold">Review {productName}</h3>
      <p className="mb-6 mt-1 text-sm text-roast">Honest reviews only — we publish the good and the not-so-good once we&apos;ve checked them.</p>
      {form}
    </div>
  ) : null;

  if (!count) {
    return (
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
        <div className="flex flex-col items-start rounded-[2rem] bg-ink p-8 text-paper md:p-10 lg:sticky lg:top-28 lg:self-start">
          <MessageSquareQuote className="size-10 text-caramel" aria-hidden />
          <p className="mt-6 font-display text-3xl font-bold leading-tight">No reviews yet.</p>
          <p className="mt-3 text-paper/75">
            Tried our {productName}? Tell other snackers what you thought — the crunch, the freshness, the can, anything.
          </p>
          <Stars rating={0} className="mt-6" starClassName="size-6 fill-paper/15 text-paper/15" />
        </div>
        {formPanel}
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2rem] bg-paper p-6 ring-1 ring-line md:p-8">
          <div className="flex items-end gap-4">
            <p className="font-display text-7xl font-black leading-none tracking-tight">{average.toFixed(1)}</p>
            <div className="pb-1">
              <Stars rating={average} starClassName="size-5" />
              <p className="mt-1 text-sm text-roast">
                {count} review{count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          {count >= 3 ? (
            <p className="mt-4 rounded-2xl bg-pista/20 px-4 py-2.5 text-sm font-medium">
              <strong>{happy}%</strong> rated it 4 stars or more
            </p>
          ) : null}

          <ul className="mt-6 space-y-1">
            {byStar.map(({ n, total }) => (
              <li key={n}>
                <button
                  type="button"
                  disabled={!total}
                  onClick={() => {
                    setStars(stars === n ? null : n);
                    setShown(PAGE);
                  }}
                  aria-pressed={stars === n}
                  className={cn(
                    "grid w-full grid-cols-[2.25rem_1fr_2rem] items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition enabled:hover:bg-cream disabled:opacity-50",
                    stars === n && "bg-cream ring-1 ring-inset ring-line",
                  )}
                >
                  <span className="inline-flex items-center gap-1 font-semibold">
                    {n}
                    <Star className="size-3.5 fill-caramel text-caramel" aria-hidden />
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-caramel" style={{ width: `${(total / count) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-roast">{total}</span>
                  <span className="sr-only">
                    {stars === n ? "Showing" : "Show"} {n}-star reviews
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">{writeButton}</div>
        </div>
      </aside>

      <div className="min-w-0">
        {formPanel ? <div className="mb-8">{formPanel}</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="flex items-center gap-2 text-sm text-roast">
            Showing {list.length} {stars ? `${stars}-star ` : ""}review{list.length === 1 ? "" : "s"}
            {stars ? (
              <button
                type="button"
                onClick={() => setStars(null)}
                className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-line hover:bg-paper"
              >
                <X className="size-3" aria-hidden /> Clear
              </button>
            ) : null}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-roast">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}
              className="rounded-full border-0 bg-paper py-1.5 pl-3 pr-8 font-semibold ring-1 ring-line focus:ring-2 focus:ring-caramel"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="mt-6 gap-4 md:columns-2 [&>li]:mb-4 [&>li]:break-inside-avoid">
          {list.slice(0, shown).map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>

        {list.length > shown ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShown((s) => s + PAGE)}
              className="inline-flex h-11 items-center rounded-full px-6 font-semibold ring-1 ring-ink/20 transition hover:bg-paper"
            >
              Show more reviews ({list.length - shown})
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReviewCard({ review: r }: { review: ReviewItem }) {
  return (
    <article className="rounded-[1.75rem] bg-paper p-5 ring-1 ring-line md:p-6">
      <header className="flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold text-paper"
          style={{ background: tone(r.name) }}
          aria-hidden
        >
          {initials(r.name)}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 font-semibold">
            {r.name}
            {r.verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3f6b2a]">
                <BadgeCheck className="size-4" aria-hidden />
                Verified buyer
              </span>
            ) : null}
          </p>
          <p className="text-xs text-roast">
            {r.location ? `${r.location} · ` : ""}
            <time dateTime={new Date(r.time).toISOString()}>{r.date}</time>
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars rating={r.rating} />
        {r.size ? <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-roast ring-1 ring-line">{r.size} can</span> : null}
      </div>
      {r.title ? <h3 className="mt-3 font-display text-lg font-bold leading-snug">{r.title}</h3> : null}
      <p className={cn("whitespace-pre-line leading-relaxed text-roast", r.title ? "mt-1.5" : "mt-3")}>{r.body}</p>

      {r.reply ? (
        <div className="mt-4 rounded-2xl bg-cream p-4 ring-1 ring-inset ring-line">
          <p className="text-xs font-bold uppercase tracking-wider text-ink">Being Nutty replied</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-roast">{r.reply}</p>
        </div>
      ) : null}
    </article>
  );
}
