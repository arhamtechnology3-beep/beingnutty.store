"use client";

import Link from "next/link";
import { site } from "@/lib/site";

export default function StoreError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto grid min-h-[70dvh] max-w-xl place-items-center px-5 pt-28 text-center">
      <div>
        <h1 className="font-display text-5xl font-black tracking-tight md:text-6xl">
          That&apos;s a tough <span className="italic text-caramel">nut.</span>
        </h1>
        <p className="mt-4 text-lg text-roast">
          Something went wrong loading this page. Please try again — your cart is safe.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className="rounded-full bg-ink px-6 py-3 font-semibold text-paper">
            Try again
          </button>
          <Link href="/" className="rounded-full border border-ink/25 px-6 py-3 font-semibold">
            Go home
          </Link>
        </div>
        <p className="mt-6 text-sm text-roast">
          Still stuck? Email <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </div>
  );
}
