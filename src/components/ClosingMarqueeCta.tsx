import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";

const PHRASE = `${"The Roy Effect · ".repeat(8)}`;

export function ClosingMarqueeCta() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimate(!reduced && shouldRunHeavyEffects());
  }, []);

  return (
    <section className="relative z-20 isolate overflow-hidden border-t border-white/10 bg-[#030014] px-5 py-24 md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex select-none items-center overflow-hidden">
        <div className={`flex w-max shrink-0 whitespace-nowrap font-display text-[22vw] uppercase leading-none text-white/[0.05] md:text-[16vw] ${animate ? "animate-cta-marquee" : ""}`}>
          <span>{PHRASE}</span>
          <span>{PHRASE}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <span className="font-mono text-xs tracking-widest text-[#DFBA73]">LAST WORD</span>
        <h2 className="mt-5 max-w-5xl text-balance font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">
          LET&apos;S MAKE THE SITE THAT ASKS FOR THE SALE.
        </h2>
        <p className="mt-6 max-w-2xl font-mono text-base leading-[1.6] text-white/90">
          One call. Your goal, your timeline, your budget — and a straight answer on whether I&apos;m the right fit.
        </p>
        <Button asChild className="mt-9 min-h-11 rounded-none bg-[#FF3333] px-7 font-mono text-xs font-bold tracking-widest text-black hover:bg-[#FF5555]">
          <Link to="/audit">GET YOUR FREE AUDIT <ArrowUpRight className="size-4" /></Link>
        </Button>
        <Link to="/book" className="mt-3 inline-flex min-h-11 items-center py-2 font-mono text-[15px] text-white/90 underline decoration-[#DFBA73] underline-offset-4 hover:text-[#DFBA73]">
          or book a discovery call
        </Link>
        <p className="mt-8 font-mono text-[15px] leading-[1.6] text-white/90">
          Houston-based. Working remote with founders and service businesses.
        </p>
      </div>
    </section>
  );
}