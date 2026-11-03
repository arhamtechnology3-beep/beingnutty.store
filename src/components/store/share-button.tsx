"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);

  const share = async () => {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
      return;
    }
    setMenu((m) => !m);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href.split("?")[0]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        aria-expanded={menu}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-ink"
      >
        <Share2 className="size-4" aria-hidden />
        Share
      </button>
      {menu ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-line bg-paper p-2 shadow-xl">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${typeof window === "undefined" ? "" : window.location.href.split("?")[0]}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-cream"
          >
            Share on WhatsApp
          </a>
          <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-cream">
            {copied ? <Check className="size-4 text-pista" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
