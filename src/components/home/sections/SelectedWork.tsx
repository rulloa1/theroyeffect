import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WorkGrid } from "@/components/WorkGrid";

/** Reuses the existing WorkGrid and its honest "studio work" copy — no invented results. */
export function SelectedWork() {
  return (
    <section id="work" className="home-section" aria-labelledby="work-title">
      <div className="home-wrap">
        <ScrollReveal className="home-section-head">
          <div>
            <p className="home-eyebrow">
              03 <b>/ Selected work</b>
            </p>
            <h2 id="work-title" className="home-display home-section-title mt-5">
              Built to be
              <br />
              noticed.
            </h2>
          </div>
          <div>
            <p className="home-section-lede">
              A look at the kind of work we ship — brand, design and build working as one.
            </p>
            <Link
              to="/work"
              className="home-link mt-6 inline-flex font-mono text-xs uppercase tracking-[0.2em] text-white/80"
            >
              <span className="inline-flex items-center gap-2">
                See all work <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <WorkGrid compact />
        </ScrollReveal>
      </div>
    </section>
  );
}
