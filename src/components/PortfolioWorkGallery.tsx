import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/refinery/Magnetic";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";
import { studyDisclosure, WORK_STUDIES } from "@/lib/work-studies";

export function PortfolioWorkGallery() {
  const [featured, ...rest] = WORK_STUDIES;
  if (!featured) return null;

  return (
    <section
      id="work"
      data-refinery-chapter="work"
      className="relative z-20 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
    >
      <ScrollReveal chapterSeam respectEffectsGuard />
      <div className="mx-auto max-w-7xl">
        <ScrollReveal respectEffectsGuard>
          <div className="grid gap-6 border-b border-[var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                SELECTED WORK
              </p>
              <h2 className="mt-4 max-w-4xl font-portfolio text-[length:var(--type-h2)] font-bold leading-none text-[var(--ink)]">
                Built to be seen. Designed to be used.
              </h2>
              <p className="mt-5 max-w-[52ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
                Three concept studies — invented Houston businesses, each used to show how the work
                actually runs, from the first audit to the finished build.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12 md:mt-20" respectEffectsGuard>
          <article className="grid border border-[var(--line)] bg-[var(--ground-raised)] lg:grid-cols-12">
            <Link
              to="/work/$slug"
              params={{ slug: featured.slug }}
              aria-label={`Read the ${featured.name} concept study`}
              className="group relative flex flex-col overflow-hidden lg:col-span-8 lg:min-h-[38rem] lg:justify-between lg:p-14"
            >
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-[var(--line)] lg:hidden">
                <img
                  src={featured.image}
                  alt={featured.imageAlt}
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-left-top"
                />
              </div>
              <img
                src={featured.image}
                alt=""
                aria-hidden="true"
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 hidden size-full object-cover object-left-top opacity-90 lg:block"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,var(--ground-sunk)_0%,var(--ground-sunk)_20%,transparent_70%)]"
              />
              <ScrollReveal
                stagger
                respectEffectsGuard
                className="relative mt-auto grid max-w-3xl grid-cols-3 border-y border-[var(--line)]"
              >
                {featured.scopeTags.map((tag) => (
                  <span
                    key={tag}
                    className="border-r border-[var(--line)] px-3 py-4 font-mono text-[11px] tracking-[0.14em] text-[var(--ink-faint)] transition-colors last:border-r-0 hover:text-[var(--gold)]"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </ScrollReveal>
            </Link>

            <div className="flex flex-col justify-end border-t border-[var(--line)] p-7 sm:p-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-12">
              <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--gold)]">
                CONCEPT STUDY · {featured.index}
              </p>
              <p className="mt-3 font-mono text-xs tracking-widest text-[var(--gold)]">
                {featured.sector.toUpperCase()}
              </p>
              <h3 className="mt-3 font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
                {featured.name}
              </h3>
              <p className="mt-5 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                {featured.summary}
              </p>
              <p className="mt-4 max-w-[60ch] font-portfolio-body text-sm leading-relaxed text-[var(--ink-faint)]">
                {studyDisclosure(featured)}
              </p>
              <Link
                to="/work/$slug"
                params={{ slug: featured.slug }}
                className="group mt-7 inline-flex min-h-11 w-fit items-center gap-2 border-b border-[var(--gold)]/60 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                READ THE STUDY
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal stagger respectEffectsGuard className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((study) => (
            <Link
              key={study.slug}
              to="/work/$slug"
              params={{ slug: study.slug }}
              aria-label={`Read the ${study.name} concept study`}
              className="group flex flex-col border border-[var(--line)] bg-[var(--ground-raised)] transition-colors hover:border-[var(--gold)]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-[var(--line)]">
                <img
                  src={study.image}
                  alt={study.imageAlt}
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[var(--dur-reveal)] ease-[var(--ease-refine)] group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <span className="font-mono text-xs tracking-widest text-[var(--gold)]">
                  CONCEPT STUDY · {study.index}
                </span>
                <h3 className="mt-3 font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
                  {study.name}
                </h3>
                <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[var(--ink-faint)]">
                  {study.sector.toUpperCase()}
                </p>
                <p className="mt-4 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                  {study.summary}
                </p>
                <p className="mt-3 max-w-[60ch] font-portfolio-body text-sm leading-relaxed text-[var(--ink-faint)]">
                  {studyDisclosure(study)}
                </p>
                <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors group-hover:text-[var(--gold)]">
                  READ THE STUDY
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </ScrollReveal>

        <p className="mt-4 font-mono text-xs leading-relaxed text-[var(--ink-faint)]">
          Client work shown on request.
        </p>

        <ScrollReveal className="mt-8" respectEffectsGuard>
          <aside className="grid gap-6 border border-[var(--line)] bg-[var(--ground-raised)] p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-9">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                FREE WEBSITE AUDIT
              </p>
              <h3 className="mt-2 max-w-[46ch] font-portfolio text-[length:var(--type-lead)] font-semibold text-[var(--ink)]">
                Get a focused teardown of your homepage, mobile experience, and conversion path.
              </h3>
            </div>
            <Magnetic className="w-full md:w-auto">
              <Button
                asChild
                size="lg"
                className="min-h-12 w-full rounded-none bg-[var(--gold)] px-7 font-mono text-xs font-bold tracking-widest text-[var(--ground)] hover:bg-[var(--ink)] md:w-auto"
              >
                <Link
                  to="/audit"
                  onClick={() => trackAnalyticsEvent("audit_cta_click", { placement: "mid" })}
                >
                  <span className="magnetic-label inline-flex items-center gap-2">
                    GET YOUR FREE AUDIT <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </Button>
            </Magnetic>
          </aside>
        </ScrollReveal>
      </div>
    </section>
  );
}
