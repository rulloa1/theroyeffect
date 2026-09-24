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
      </div>
    </section>
  );
}
