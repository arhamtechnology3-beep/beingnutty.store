import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

const WORDS = [
  { text: "Kaju", Icon: Cashew },
  { text: "Badam", Icon: Almond },
  { text: "Pista", Icon: Pistachio },
  { text: "Smoked", Icon: Cashew },
  { text: "Raw", Icon: Almond },
  { text: "Mixes", Icon: Pistachio },
];

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-10 pr-10 animate-[marquee_38s_linear_infinite] motion-reduce:animate-none"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {items.map(({ text, Icon }, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={`font-display text-6xl font-black tracking-tight md:text-8xl ${outline ? "text-outline" : ""}`}>
              {text}
            </span>
            <Icon className="w-12 md:w-16" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section aria-label="Our range" className="overflow-hidden border-y border-line bg-paper py-10 md:py-14">
      <div className="-rotate-2 space-y-4">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  );
}
