import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";

export function HeroContent() {
  return (
    <div className="relative z-20 mx-auto grid min-h-[calc(100svh-1rem)] w-full max-w-[96rem] grid-cols-1 overflow-hidden border-x border-b border-white/10 bg-[#0a0620] pt-20 md:min-h-[calc(100svh-2rem)] md:grid-cols-12 md:pt-24">
      <div className="relative order-2 min-h-[18rem] overflow-hidden border-t border-white/10 md:order-1 md:col-span-5 md:min-h-0 md:border-r md:border-t-0 lg:col-span-4">
        <img
          src={portraitAsset.url}
          alt="Rory Ulloa, design developer and web developer"
          width={896}
          height={1078}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-contain object-bottom grayscale contrast-125 md:object-cover md:object-[52%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8">
          <p className="font-portfolio text-3xl font-bold leading-none text-white md:text-5xl">RORY ULLOA</p>
          <p className="mt-2 font-mono text-[10px] font-bold tracking-widest text-[#DFBA73]">THE ROY EFFECT · HOUSTON</p>
        </div>
      </div>

      <div className="relative order-1 flex flex-col justify-center px-5 py-10 sm:px-8 md:order-2 md:col-span-7 md:px-10 md:py-16 lg:col-span-8 lg:px-16">
        <div aria-hidden className="portfolio-dot-grid absolute inset-0 opacity-40" />
        <div className="relative max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#DFBA73]" />
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#DFBA73] sm:text-xs">
              DESIGN DEVELOPER + WEB DEVELOPER
            </p>
          </div>
          <h1 className="mt-6 max-w-4xl font-portfolio text-[2.8rem] font-bold leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            I design and build websites people remember.
          </h1>
          <p className="mt-6 max-w-2xl font-portfolio-body text-base leading-relaxed text-white/75 md:text-lg">
            I combine creative direction, modern web development, motion, and strategic design to
            build digital experiences that look exceptional and help businesses stand out.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="rounded-none px-7 font-mono text-xs font-bold tracking-widest">
              <Link to="/" hash="work">VIEW MY WORK <ArrowUpRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-white/30 bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-white hover:border-[#DFBA73] hover:bg-white/5">
              <Link to="/brief">START A PROJECT</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
