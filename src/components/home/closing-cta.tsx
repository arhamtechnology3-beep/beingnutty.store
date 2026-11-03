import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="grain relative overflow-hidden bg-caramel px-5 py-32 text-center text-ink md:py-44">
      <Cashew aria-hidden className="absolute left-[6%] top-[14%] w-20 animate-[bob_6s_ease-in-out_infinite] md:w-32" />
      <Almond aria-hidden className="absolute right-[8%] top-[20%] w-16 animate-[bob_7s_ease-in-out_infinite] md:w-24" />
      <Pistachio aria-hidden className="absolute bottom-[12%] left-[14%] w-16 animate-[bob_5s_ease-in-out_infinite] md:w-24" />
      <Cashew aria-hidden className="absolute bottom-[16%] right-[14%] w-12 animate-[bob_8s_ease-in-out_infinite] md:w-20" />
      <h2 id="cta-title" className="relative font-display text-[clamp(4rem,15vw,14rem)] font-black italic leading-[0.85] tracking-tight">
        Stay nutty.
      </h2>
      <p className="relative mx-auto mt-6 max-w-md text-xl">Your next can of kaju, badam or pista is a few taps away.</p>
      <Link
        href="/collections/dry-fruits"
        className="group relative mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-paper transition-transform hover:scale-105"
      >
        Shop now
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
