import Link from "next/link";
import { Cashew } from "@/components/visuals/nuts";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <Cashew className="mx-auto w-24 animate-[bob_6s_ease-in-out_infinite]" />
        <h1 className="mt-6 font-display text-6xl font-black tracking-tight md:text-8xl">
          Oh <span className="italic text-caramel">nuts.</span>
        </h1>
        <p className="mt-4 text-xl text-roast">We couldn&apos;t find that page.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-ink px-6 py-3 font-semibold text-paper">
            Go home
          </Link>
          <Link href="/collections/dry-fruits" className="rounded-full border border-ink/25 px-6 py-3 font-semibold">
            Shop dry fruits
          </Link>
        </div>
      </div>
    </main>
  );
}
