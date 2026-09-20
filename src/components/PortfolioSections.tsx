import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";

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
        className="relative z-20 border-y border-white/10 bg-[var(--ground-raised)] px-5 py-24 md:px-10 md:py-36"
      >
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                WHAT I DO
              </p>
              <h2 className="mt-4 font-portfolio text-5xl font-bold leading-[0.92] text-white md:text-7xl">
                Design and development working as one.
              </h2>
              <p className="mt-7 max-w-xl font-portfolio-body text-lg leading-relaxed text-white/75">
                I take projects from the first visual concept through design, development,
                interaction, and launch—creating one cohesive digital experience.
              </p>
              <p className="mt-5 max-w-xl font-portfolio-body text-sm leading-relaxed text-white/55">
                Every project is scoped around its goals, content, functionality, and creative
                direction.
              </p>
              <Link
                to="/services"
                className="group mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--gold)] transition-colors hover:text-white"
              >
                EXPLORE SERVICES
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ol className="border-t border-white/10">
              {CAPABILITIES.map((capability, index) => (
                <li
                  key={capability}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 py-5 transition-colors hover:border-[var(--gold)]/50 md:py-6"
                >
                  <span className="font-mono text-xs text-white/35">0{index + 1}</span>
                  <span className="font-portfolio text-xl font-semibold text-white transition-transform group-hover:translate-x-1 md:text-3xl">
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
            </ol>
          </div>
        </ScrollReveal>
      </section>

      <section className="relative z-20 overflow-hidden bg-[var(--ground)] px-5 py-28 md:px-10 md:py-44">
        <div
          aria-hidden
          className="portfolio-crosshair absolute right-[8%] top-[18%] size-40 opacity-50"
        />
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <p className="font-mono text-xs font-bold tracking-widest text-[var(--furnace)]">
            DESIGN PHILOSOPHY
          </p>
          <h2 className="mt-5 max-w-6xl font-portfolio text-5xl font-bold leading-[0.9] text-white md:text-8xl">
            Your website should feel like an experience—
            <span className="text-white/35">not a template.</span>
          </h2>
          <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-2 md:gap-20">
            <p className="max-w-2xl font-portfolio-body text-lg leading-relaxed text-white/75">
              I combine strategy, visual storytelling, responsive development, and thoughtful
              interaction to create websites that communicate value before visitors read every word.
            </p>
            <p className="max-w-2xl font-portfolio-body text-lg leading-relaxed text-white/75">
              You approve the design before the build begins. The experience that gets approved is
              the experience that goes live.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section
        id="about"
        className="relative z-20 border-y border-white/10 bg-[var(--ground-raised)] px-5 py-24 md:px-10 md:py-36"
      >
        <ScrollReveal
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center"
          respectEffectsGuard
        >
          <div className="relative min-h-[28rem] overflow-hidden border border-white/10 bg-[var(--ground)] sm:min-h-[36rem] lg:col-span-5">
            <img
              src={portraitAsset.url}
              alt="Rory Ulloa, design developer and web developer behind The Roy Effect"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain object-bottom grayscale contrast-125"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--ground)] to-transparent" />
            <p className="absolute bottom-6 left-6 font-mono text-xs tracking-widest text-[var(--gold)]">
              RORY ULLOA · HOUSTON, TEXAS
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">ABOUT</p>
            <h2 className="mt-4 font-portfolio text-5xl font-bold leading-[0.92] text-white md:text-7xl">
              Creative vision backed by real development.
            </h2>
            <p className="mt-7 max-w-2xl font-portfolio-body text-lg leading-relaxed text-white/75">
              I&apos;m Rory Ulloa, the design developer behind The Roy Effect. I create distinctive
              digital experiences by bringing design and development together—from the first idea to
              the finished website.
            </p>
            <p className="mt-5 max-w-2xl font-portfolio-body text-base leading-relaxed text-white/60">
              I work solo from Houston, shaping brand systems, marketing sites, and product
              interfaces, then shipping them in Webflow, Framer, or TanStack.
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-white transition-colors hover:text-[var(--gold)]"
            >
              MORE ABOUT ME
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section
        id="contact"
        className="relative z-20 overflow-hidden bg-[var(--gold)] px-5 py-24 text-[var(--ground)] md:px-10 md:py-36"
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-20 font-portfolio text-[18rem] font-bold leading-none text-[var(--ground)]/5"
        >
          R
        </div>
        <ScrollReveal className="relative mx-auto max-w-7xl" respectEffectsGuard>
          <p className="font-mono text-xs font-bold tracking-widest">START A PROJECT</p>
          <h2 className="mt-4 max-w-5xl font-portfolio text-5xl font-bold leading-[0.9] md:text-8xl">
            Have a website idea worth building?
          </h2>
          <div className="mt-10 grid gap-8 border-t border-[var(--ground)]/20 pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-2xl font-portfolio-body text-lg leading-relaxed text-[var(--ground)]/75">
              Tell me what you&apos;re creating, improving, or launching. I&apos;ll help turn it
              into a polished digital experience.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-[var(--ground)] px-7 font-mono text-xs font-bold tracking-widest text-white hover:bg-[var(--ground-raised)]"
              >
                <Link to="/brief">
                  START A PROJECT <ArrowUpRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none border-[var(--ground)]/40 bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-[var(--ground)] hover:bg-[var(--ground)] hover:text-white"
              >
                <Link to="/book">CONTACT ME</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
