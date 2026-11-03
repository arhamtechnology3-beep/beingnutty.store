"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { scrollToTop } from "./smooth-scroll";

export function FloatingActions() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/checkout")) return null;

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 transition-[bottom] duration-300 md:right-6 [html[data-sticky-bar]_&]:bottom-32 md:[html[data-sticky-bar]_&]:bottom-28">
      <button
        type="button"
        onClick={scrollToTop}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        aria-label="Back to top"
        className={cn(
          "grid size-11 place-items-center rounded-full border border-line bg-paper/90 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5",
          showTop ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="size-5" />
      </button>
      <a
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi Being Nutty! I have a question about ")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-[#25d366]/30 transition-transform hover:scale-105"
      >
        <MessageCircle className="size-7" />
      </a>
    </div>
  );
}
