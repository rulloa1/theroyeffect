import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function PortfolioWorkGallery() {
  return (
    <section
      id="work"
      data-refinery-chapter="work"
      className="relative z-20 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal respectEffectsGuard>
          <div className="grid gap-6 border-b border-[var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                SELECTED WORK
              </p>
              <h2 className="mt-4 max-w-4xl font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92] text-[var(--ink)]">
                Built to be seen. Designed to be used.
              </h2>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12 md:mt-20" respectEffectsGuard>
          <article className="grid border border-[var(--line)] bg-[var(--ground-raised)] lg:grid-cols-12">
            <Link
              to="/case-study"
              aria-label="View the Houston service business website case study"
              className="group relative flex min-h-[28rem] flex-col justify-between overflow-hidden p-7 sm:p-10 lg:col-span-8 lg:min-h-[38rem] lg:p-14"
            >
              <div aria-hidden className="portfolio-dot-grid absolute inset-0 opacity-50" />
              <div
                aria-hidden
                className="portfolio-crosshair absolute right-[12%] top-[12%] size-44 opacity-50"
              />
              <span className="relative font-mono text-xs tracking-widest text-[var(--gold)]">
                FEATURED CASE STUDY · 01
              </span>
              <div className="relative grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {["PROBLEM", "BRAND", "MOBILE", "LAUNCH"].map((label, index) => (
                  <span
                    key={label}
                    className="border border-[var(--line)] bg-[var(--ground-sunk)]/70 p-4 font-mono text-[10px] tracking-widest text-[var(--ink-muted)] transition-colors group-hover:border-[var(--gold)]/40"
                  >
                    0{index + 1}
                    <span className="mt-8 block text-[var(--ink)]">{label}</span>
                  </span>
                ))}
              </div>
            </Link>

            <div className="flex flex-col justify-end border-t border-[var(--line)] p-7 sm:p-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-12">
              <p className="font-mono text-xs tracking-widest text-[var(--gold)]">WEBSITE REDESIGN</p>
              <h3 className="mt-3 font-portfolio text-[length:var(--type-h3)] font-bold leading-none text-[var(--ink)]">
                Redesigning a Houston service business site
              </h3>
              <p className="mt-5 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                A representative walkthrough from a cluttered, hard-to-use website to a clear brand
                system and a fast, mobile-first site. No client names, numbers, or quotes are
                attached.
              </p>
              <Link
                to="/case-study"
                className="group mt-7 inline-flex min-h-11 w-fit items-center gap-2 border-b border-[var(--gold)]/60 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                VIEW CASE STUDY
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal className="mt-8" respectEffectsGuard>
          <aside className="grid gap-6 border border-[var(--line)] bg-[var(--ground-raised)] p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-9">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                FREE WEBSITE AUDIT
              </p>
              <h3 className="mt-2 font-portfolio text-[length:var(--type-h3)] font-bold text-[var(--ink)]">
                Get a focused teardown of your homepage, mobile experience, and conversion path.
              </h3>
            </div>
            <Link
              to="/audit"
              className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-[var(--gold)]/60 px-1 py-3 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              GET YOUR FREE AUDIT <ArrowUpRight className="size-4" />
            </Link>
          </aside>
        </ScrollReveal>
      </div>
    </section>
  );
}
