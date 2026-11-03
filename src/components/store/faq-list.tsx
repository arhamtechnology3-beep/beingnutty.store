import { Plus } from "lucide-react";

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.q} className="group py-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
            <h3 className="font-display text-xl font-bold md:text-2xl">{f.q}</h3>
            <Plus className="size-6 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
          </summary>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-roast">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
