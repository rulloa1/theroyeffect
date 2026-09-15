import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cta } from "@/components/ui/button";

export function HeroContent() {
  return (
    <div className="pointer-events-none relative z-20 flex min-h-[42rem] w-full flex-col justify-start px-5 pt-28 sm:px-8 md:min-h-screen md:justify-center md:px-10 md:pt-24">
      <div className="mx-auto w-full max-w-7xl">
      <div className="parallax-near max-w-3xl md:max-w-[54%]" style={{ transformStyle: "preserve-3d" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#DFBA73] sm:text-xs">Houston · brand, UI/UX, no-code build</p>
      <h1 className="mt-4 max-w-3xl font-display text-[2.75rem] uppercase leading-[0.92] text-white sm:text-6xl md:text-7xl lg:text-8xl">
        A website that looks expensive and actually asks for the sale.
      </h1>
      <p className="mt-5 max-w-2xl font-mono text-sm leading-7 text-white/85">
        I&apos;m Rory Ulloa. I design and ship high-contrast sites for founders and local service businesses in Houston and remote.
      </p>
      <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
        <Link to="/audit" className={cta()}>
          GET A FREE 5-MINUTE AUDIT <ArrowUpRight className="size-4" />
        </Link>
        <Link to="/work" className={cta({ intent: "secondary" }, "hidden sm:inline-flex")}>
          SEE THE WORK
        </Link>
      </div>
      <div className="parallax-mid mt-5 flex max-w-2xl flex-wrap gap-2 font-mono text-[10px] tracking-wider text-white/80">
        <span className="float-3d border border-white/15 bg-white/[0.03] px-3 py-1 text-[#F6DC9A] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)]">
          UI/UX DESIGN
        </span>
        <span className="float-3d border border-white/15 bg-white/[0.03] px-3 py-1 text-[#FF3333] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] [animation-delay:-2s]">
          NO-CODE DEVELOPMENT
        </span>
        <span className="float-3d border border-white/15 bg-white/[0.03] px-3 py-1 text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] [animation-delay:-4s]">
          CREATIVE DIRECTION
        </span>
      </div>
      <p className="mt-4 font-mono text-[9px] font-bold tracking-[0.22em] text-[#DFBA73] uppercase sm:text-[10px]">
        YOUR IDEA. <span className="text-[#FF3333]">YOUR BRAND.</span> YOUR IMPACT.
      </p>
      </div>
      </div>
    </div>
  );
}
