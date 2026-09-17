import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { FOUNDER } from "../content";

/** The one place the founder appears — emerging from the dark, the network quietly behind him. */
export function Founder() {
  return (
    <section id="about" className="home-section" aria-labelledby="founder-title">
      <div className="home-wrap home-founder">
        <ScrollReveal>
          <figure className="home-founder-figure mx-auto">
            <div className="home-founder-glow" aria-hidden="true" />
            <svg className="home-founder-network" viewBox="0 0 400 400" aria-hidden="true">
              <path className="net-line" d="M20 80 L140 40 L260 110 L380 60" fill="none" />
              <path className="net-line" d="M10 240 L120 180 L240 250 L390 190" fill="none" />
              <path
                className="net-line net-line--red"
                d="M40 330 L160 290 L280 340 L370 300"
                fill="none"
              />
              <path className="net-line net-line--red" d="M140 40 L120 180 L160 290" fill="none" />
              <path className="net-line" d="M260 110 L240 250 L280 340" fill="none" />
              <circle cx="140" cy="40" r="2.5" />
              <circle cx="260" cy="110" r="2.5" />
              <circle cx="120" cy="180" r="3" className="red" />
              <circle cx="240" cy="250" r="2.5" />
              <circle cx="160" cy="290" r="3" className="red" />
              <circle cx="280" cy="340" r="2.5" />
            </svg>
            <picture>
              <source
                srcSet="/brand/founder-rory-520.webp 520w, /brand/founder-rory.webp 896w"
                sizes="(max-width: 960px) 80vw, 34rem"
                type="image/webp"
              />
              <img
                src="/brand/founder-rory.webp"
                alt="Rory Ulloa, founder of The Roy Effect"
                width={896}
                height={1077}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </figure>
        </ScrollReveal>

        <ScrollReveal>
          <p className="home-eyebrow">
            05 <b>/ Founder</b>
          </p>
          <h2 id="founder-title" className="home-display home-founder-quote mt-6">
            {FOUNDER.lines[0]}
            <br />
            <span className="dim">{FOUNDER.lines[1]}</span>
            <br />
            {FOUNDER.lines2[0]}
            <br />
            <span className="xp-accent">{FOUNDER.lines2[1]}</span>
          </h2>
          <p className="home-section-lede mt-8">{FOUNDER.body}</p>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-white/60">
            {FOUNDER.name} — {FOUNDER.role}
          </p>
          <Link
            to="/about"
            className="home-link mt-6 inline-flex font-mono text-xs uppercase tracking-[0.2em] text-white/85"
          >
            <span className="inline-flex items-center gap-2">
              About The Roy Effect <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
