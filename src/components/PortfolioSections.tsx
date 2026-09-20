import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Magnetic } from "@/components/refinery/Magnetic";

const CAPABILITIES = [
  "Website Design",
  "Web Development",
  "Landing Pages",
  "Interactive Experiences",
  "UI/UX Design",
  "Website Redesign",
  "Motion & 3D Web Experiences",
];

export function PortfolioSections() {
  return (
    <>
      <section
        id="services"
        data-refinery-chapter="services"
        className="relative z-20 border-b border-[var(--line)] bg-[var(--veil-raised)] px-[var(--gutter)] py-[var(--section-y)]"
      >
        <ScrollReveal chapterSeam respectEffectsGuard />
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                WHAT I DO
              </p>
              <h2 className="mt-4 font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92] text-[var(--ink)]">
                Design and development working as one.
              </h2>
              <p className="mt-7 max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
                I take projects from the first visual concept through design, development,
                interaction, and launch—creating one cohesive digital experience.
              </p>
              <p className="mt-5 max-w-[68ch] font-portfolio-body text-sm leading-relaxed text-[var(--ink-faint)]">
                Every project is scoped around its goals, content, functionality, and creative
                direction.
              </p>
              <Link
                to="/services"
                className="group mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--gold)] transition-colors hover:text-[var(--ink)]"
              >
                EXPLORE SERVICES
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ScrollReveal
              as="ol"
              stagger
              className="border-t border-[var(--line)]"
              respectEffectsGuard
            >
              {CAPABILITIES.map((capability, index) => (
                <li
                  key={capability}
                  data-refinery-row={index}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--line)] py-5 transition-colors hover:border-[var(--gold)]/50 md:py-6"
                >
                  <span className="font-mono text-xs text-[var(--ink-faint)]">0{index + 1}</span>
                  <span className="font-portfolio text-[length:var(--type-h3)] font-semibold text-[var(--ink)] transition-transform group-hover:translate-x-1">
                    {capability}
                  </span>
                  <span
                    aria-hidden
                    className="text-[var(--gold)] opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ↗
                  </span>
                </li>
              ))}
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </section>

      <section
        data-refinery-chapter="promise"
        className="relative z-20 overflow-hidden bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
      >
        <ScrollReveal chapterSeam respectEffectsGuard />
        <div
          aria-hidden
          className="portfolio-crosshair absolute right-[8%] top-[18%] size-40 opacity-50"
        />
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
            DESIGN PHILOSOPHY
          </p>
          <h2 className="mt-5 max-w-6xl font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92] text-[var(--ink)]">
            Your website should feel like an experience—
            <span className="text-white/35">not a template.</span>
          </h2>
          <ScrollReveal
            stagger
            className="mt-12 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-2 md:gap-20"
            respectEffectsGuard
          >
            <p className="max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
              I combine strategy, visual storytelling, responsive development, and thoughtful
              interaction to create websites that communicate value before visitors read every word.
            </p>
            <p className="max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
              You approve the design before the build begins. The experience that gets approved is
              the experience that goes live.
            </p>
          </ScrollReveal>
        </ScrollReveal>
      </section>

      <section
        id="about"
        data-refinery-chapter="about"
        className="relative z-20 border-b border-[var(--line)] bg-[var(--veil-raised)] px-[var(--gutter)] py-[var(--section-y)]"
      >
        <ScrollReveal chapterSeam respectEffectsGuard />
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                ABOUT
              </p>
              <h2 className="mt-4 font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92] text-[var(--ink)]">
                Creative vision backed by real development.
              </h2>
              <p className="mt-7 max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
                I&apos;m Rory Ulloa, the design developer behind The Roy Effect. I create
                distinctive digital experiences by bringing design and development together—from the
                first idea to the finished website.
              </p>
              <p className="mt-5 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-faint)]">
                I work solo from Houston, shaping brand systems, marketing sites, and product
                interfaces, then shipping them in Webflow, Framer, or TanStack.
              </p>
              <Link
                to="/about"
                className="group mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:text-[var(--gold)]"
              >
                MORE ABOUT ME
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <dl className="border-t border-[var(--line)] font-mono text-xs tracking-widest">
              {[
                ["BASED", "Houston, Texas"],
                ["PRACTICE", "Solo — design and build"],
                ["STACK", "Webflow · Framer · TanStack"],
                ["AVAILABILITY", "Taking projects"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-[var(--line)] py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:py-6"
                >
                  <dt className="text-[var(--ink-faint)]">{label}</dt>
                  <dd className="text-[var(--ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ScrollReveal>
      </section>

      <section
        id="contact"
        data-refinery-chapter="finale"
        className="relative z-20 overflow-hidden bg-[var(--gold)] px-[var(--gutter)] py-[var(--section-y)] text-[var(--ground)]"
      >
        <ScrollReveal chapterSeam respectEffectsGuard />
        <div
          aria-hidden
          className="absolute -right-10 -top-20 font-portfolio text-[18rem] font-bold leading-none text-[var(--ground)]/5"
        >
          R
        </div>
        <ScrollReveal className="relative mx-auto max-w-7xl" respectEffectsGuard>
          <p className="font-mono text-xs font-bold tracking-widest">START A PROJECT</p>
          <h2 className="mt-4 max-w-5xl font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92]">
            Have a website idea worth building?
          </h2>
          <div className="mt-10 grid gap-8 border-t border-[var(--ground)]/20 pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ground)]/75">
              Tell me what you&apos;re creating, improving, or launching. I&apos;ll help turn it
              into a polished digital experience.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-none bg-[var(--ground)] px-7 font-mono text-xs font-bold tracking-widest text-white hover:bg-[var(--ground-raised)]"
                >
                  <Link to="/brief">
                    <span className="magnetic-label inline-flex items-center gap-2">
                      START A PROJECT <ArrowUpRight />
                    </span>
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-none border-[var(--ground)]/40 bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-[var(--ground)] hover:bg-[var(--ground)] hover:text-white"
                >
                  <Link to="/book">
                    <span className="magnetic-label">BOOK A FREE 15-MIN CALL</span>
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
