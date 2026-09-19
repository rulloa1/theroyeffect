import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SHOWCASE_WORK } from "@/lib/site-content";

export function PortfolioWorkGallery() {
  return (
    <section id="work" className="relative z-20 bg-[#030014] px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal respectEffectsGuard>
          <div className="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[#DFBA73]">
                SELECTED WORK
              </p>
              <h2 className="mt-4 max-w-4xl font-portfolio text-5xl font-bold leading-[0.92] text-white md:text-7xl">
                Built to be seen. Designed to be used.
              </h2>
            </div>
            <Link
              to="/work"
              className="group inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-white transition-colors hover:text-[#DFBA73]"
            >
              VIEW ALL WORK
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-12 space-y-16 md:mt-20 md:space-y-28">
          {SHOWCASE_WORK.map((project, index) => (
            <ScrollReveal key={project.slug} respectEffectsGuard>
              <article
                className={`grid gap-7 lg:grid-cols-12 lg:items-end ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <Link
                  to="/work"
                  aria-label={`View ${project.title}`}
                  className="group relative block aspect-[4/3] overflow-hidden border border-white/10 bg-[#0a0620] lg:col-span-8"
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-110 motion-reduce:transition-none"
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030014]/75 via-transparent to-transparent" />
                  <span className="absolute right-5 top-5 grid size-11 place-items-center border border-white/20 bg-[#030014]/70 font-mono text-xs text-[#DFBA73] backdrop-blur-md">
                    0{index + 1}
                  </span>
                </Link>

                <div className="lg:col-span-4 lg:pb-2">
                  <p className="font-mono text-xs tracking-widest text-[#DFBA73]">
                    {project.eyebrow}
                  </p>
                  <h3 className="mt-3 font-portfolio text-4xl font-bold leading-none text-white md:text-5xl">
                    {project.title}
                  </h3>
                  <p className="mt-5 max-w-xl font-portfolio-body text-base leading-relaxed text-white/75">
                    {project.result}
                  </p>
                  <Link
                    to="/work"
                    className="group mt-7 inline-flex min-h-11 items-center gap-2 border-b border-[#DFBA73]/60 font-mono text-xs font-bold tracking-widest text-white transition-colors hover:border-[#FF3333] hover:text-[#DFBA73]"
                  >
                    VIEW PROJECT
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-16 max-w-2xl border-t border-white/10 pt-6 font-portfolio-body text-sm leading-relaxed text-white/60">
          Named client work is shared with written permission. I can walk you through live projects
          and the thinking behind them on a call.
        </p>
      </div>
    </section>
  );
}