import { HardLink } from "@/components/store/hard-link";
import { Almond, Cashew, Pistachio } from "@/components/visuals/nuts";

const WORDS = [
  { text: "Kaju", href: "/collections/buy-cashews-online", Icon: Cashew },
  { text: "Badam", href: "/collections/buy-almonds-online", Icon: Almond },
  { text: "Pista", href: "/collections/buy-pistachios-online", Icon: Pistachio },
  { text: "Smoked", href: "/collections/roasted-nuts", Icon: Cashew },
  { text: "Raw", href: "/collections/raw-nuts", Icon: Almond },
  { text: "Mixes", href: "/collections/mixes", Icon: Pistachio },
];

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-10 pr-10 animate-[marquee_38s_linear_infinite] motion-reduce:animate-none hover:[animation-play-state:paused]"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {items.map(({ text, href, Icon }, i) => (
          <span key={i} className="flex items-center gap-10">
            <HardLink
              href={href}
              className={`font-display text-6xl font-black tracking-tight transition-colors md:text-8xl ${
                outline ? "text-outline hover:text-caramel hover:[-webkit-text-stroke-color:var(--caramel)]" : "hover:text-caramel"
              }`}
            >
              {text}
            </HardLink>
            <HardLink href={href} aria-hidden tabIndex={-1}>
              <Icon className="w-12 md:w-16 transition-transform hover:scale-110" />
            </HardLink>
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
