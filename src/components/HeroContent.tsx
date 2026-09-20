import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/refinery/Magnetic";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";

const HEADLINE = "I design and build websites people remember.";

export function HeroContent() {
  return (
    <div className="relative z-20 mx-auto grid min-h-[calc(100svh-1rem)] w-full max-w-[96rem] grid-cols-1 overflow-hidden border-x border-b border-[var(--line)] bg-[var(--veil-hero)] pt-20 md:min-h-[calc(100svh-2rem)] md:grid-cols-12 md:pt-24">
      <div className="relative order-2 min-h-[18rem] overflow-hidden border-t border-[var(--line)] bg-[var(--ground-raised)] md:order-1 md:col-span-5 md:min-h-0 md:border-r md:border-t-0 lg:col-span-4">
        <div className="hero-portrait absolute inset-0">
          <img
            src={portraitAsset.url}
            alt="Rory Ulloa, design developer and web developer"
            width={896}
            height={1078}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="hero-portrait-image absolute inset-0 h-full w-full object-contain object-bottom grayscale contrast-125 md:object-cover md:object-[52%_center]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ground)] via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8">
          <p className="font-portfolio text-3xl font-bold leading-none text-[var(--ink)] md:text-5xl">
            RORY ULLOA
          </p>
          <p className="mt-2 font-mono text-[10px] font-bold tracking-widest text-[var(--gold)]">
            THE ROY EFFECT · HOUSTON
          </p>
        </div>
      </div>

      <div className="relative order-1 flex flex-col justify-center px-5 py-10 sm:px-8 md:order-2 md:col-span-7 md:px-10 md:py-16 lg:col-span-8 lg:px-16">
        <div aria-hidden className="hero-refinery-fallback refinery-ember absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,var(--ground-raised)_0%,var(--ground-raised)_35%,transparent_55%)] opacity-95"
        />
        <div aria-hidden className="portfolio-dot-grid absolute inset-0 z-[2] opacity-40" />
        <div className="relative z-10 max-w-4xl">
          <div className="hero-eyebrow flex items-center gap-3">
            <span className="hero-eyebrow-rule h-px w-8 origin-left bg-[var(--gold)]" />
            <p className="hero-eyebrow-text font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--gold)] sm:text-xs">
              DESIGN DEVELOPER + WEB DEVELOPER
            </p>
          </div>
          <h1
            aria-label={HEADLINE}
            className="hero-headline mt-6 max-w-4xl font-portfolio text-[length:var(--type-display)] font-bold leading-[0.9] text-[var(--ink)]"
          >
            <span aria-hidden="true">
              {HEADLINE.split(" ").map((word, index, words) => (
                <span key={`${word}-${index}`}>
                  <span className="inline-block overflow-hidden align-bottom">
                    <span
                      className="hero-word inline-block"
                      style={{ "--word-index": index } as CSSProperties}
                    >
                      {word}
                    </span>
                  </span>
                  {index < words.length - 1 ? " " : null}
                </span>
              ))}
            </span>
          </h1>
          <p className="hero-body mt-6 max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
            I combine creative direction, modern web development, motion, and strategic design to
            build digital experiences that look exceptional and help businesses stand out.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="hero-cta hero-cta-primary w-full sm:w-auto">
              <Magnetic className="w-full">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-none px-7 font-mono text-xs font-bold tracking-widest"
                >
                  <Link to="/" hash="work">
                    <span className="magnetic-label inline-flex items-center gap-2">
                      VIEW MY WORK <ArrowUpRight />
                    </span>
                  </Link>
                </Button>
              </Magnetic>
            </span>
            <span className="hero-cta hero-cta-secondary w-full sm:w-auto">
              <Magnetic className="w-full">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-none border-[var(--line)] bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--ink)]/5"
                >
                  <Link to="/brief">
                    <span className="magnetic-label">START A PROJECT</span>
                  </Link>
                </Button>
              </Magnetic>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
