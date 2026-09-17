import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function FinalCTA() {
  return (
    <section id="contact" className="home-section home-final" aria-labelledby="final-title">
      <div className="home-wrap">
        <ScrollReveal>
          <p className="home-eyebrow">
            06 <b>/ Start</b>
          </p>
          <h2 id="final-title" className="home-display home-final-title mt-6">
            Your business
            <br />
            should work
            <span className="xp-accent">as hard as you do.</span>
          </h2>
          <div className="home-final-row">
            <Link to="/brief" className="home-btn home-btn--primary" data-magnetic>
              Create the effect
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <div className="home-final-links">
              <Link to="/audit" className="home-link">
                Free 5-minute audit
              </Link>
              <Link to="/book" className="home-link">
                Book a discovery call
              </Link>
              <a href="mailto:rory@theroyeffect.com" className="home-link">
                rory@theroyeffect.com
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Local search context and internal links carried over from the previous homepage. */}
        <div className="mt-24 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h3 className="font-display text-2xl uppercase text-white md:text-3xl">
              Websites, AI &amp; automation in Houston
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
              Based near Houston and working remotely with founders and service businesses across
              the US. Most projects start with the free audit or a short discovery call.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 font-mono text-xs uppercase tracking-[0.16em]">
            <Link to="/guides/houston-website-cost" className="home-link text-[var(--home-gold)]">
              Houston website cost
            </Link>
            <Link
              to="/guides/squarespace-vs-custom-website"
              className="home-link text-[var(--home-gold)]"
            >
              Squarespace vs custom
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
