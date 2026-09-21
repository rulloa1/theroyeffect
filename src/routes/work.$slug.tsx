import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PortfolioHeader } from "@/components/PortfolioHeader";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Magnetic } from "@/components/refinery/Magnetic";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";
import { findStudy, studyDisclosure, WORK_STUDIES } from "@/lib/work-studies";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const study = findStudy(params.slug);
    if (!study) throw notFound();
    return study;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Study not found — The Roy Effect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} — concept study | The Roy Effect`;
    const url = `${SITE_URL}/work/${loaderData.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: `${loaderData.name} — concept study`,
            description: loaderData.summary,
            url,
            about: loaderData.sector,
            author: { "@id": "https://theroyeffect.com/#person" },
            isAccessibleForFree: true,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main id="main" tabIndex={-1} className="min-h-screen bg-[var(--ground)] px-[var(--gutter)] py-[var(--section-y)] pt-28 text-[var(--ink)]">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-portfolio text-[length:var(--type-h2)] font-bold">Study not found</h1>
        <p className="mt-4 max-w-[68ch] font-portfolio-body text-base text-[var(--ink-muted)]">
          That study link is no longer active.
        </p>
        <Link
          to="/work"
          className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[var(--gold)]/60 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:text-[var(--gold)]"
        >
          SEE ALL WORK <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </main>
  ),
  component: WorkStudyPage,
});

function WorkStudyPage() {
  const study = Route.useLoaderData();
  const others = WORK_STUDIES.filter((entry) => entry.slug !== study.slug);

  return (
    <>
      <PortfolioHeader />
      <main id="main" tabIndex={-1} className="min-h-screen bg-[var(--ground)] pt-24 text-[var(--ink)]">
        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal respectEffectsGuard>
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
                CONCEPT STUDY · {study.index}
              </p>
              <h1 className="mt-4 max-w-5xl font-portfolio text-[length:var(--type-display)] font-bold leading-[0.92]">
                {study.name}
              </h1>
              <p className="mt-4 font-mono text-xs tracking-widest text-[var(--ink-muted)]">
                {study.sector.toUpperCase()}
              </p>
              <p className="mt-4 max-w-[68ch] font-portfolio-body text-sm leading-relaxed text-[var(--ink-faint)]">
                {studyDisclosure(study)}
              </p>
            </ScrollReveal>

            <ScrollReveal className="mt-10" respectEffectsGuard>
              <div className="aspect-[16/10] w-full overflow-hidden border border-[var(--line)] bg-[var(--ground-raised)]">
                <img
                  src={study.image}
                  alt={study.imageAlt}
                  width={1440}
                  height={900}
                  loading="eager"
                  decoding="async"
                  className="size-full object-cover"
                />
              </div>
            </ScrollReveal>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--line)] pb-5">
              {study.scopeTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-widest text-[var(--ink-faint)]"
                >
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>

            <p className="mt-8 max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
              {study.summary}
            </p>
          </div>
        </section>

        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <ScrollReveal chapterSeam respectEffectsGuard />
          <div className="mx-auto max-w-7xl">
            <ScrollReveal respectEffectsGuard>
              <h2 className="font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.95]">
                The problem
              </h2>
              <p className="mt-4 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                {study.problemIntro}
              </p>
            </ScrollReveal>
            <ScrollReveal as="ol" stagger respectEffectsGuard className="mt-8 max-w-[68ch]">
              {study.problems.map((problem, index) => (
                <li
                  key={problem}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-[var(--line)] py-5 first:border-t"
                >
                  <span className="font-mono text-xs tracking-widest text-[var(--gold)]">
                    0{index + 1}
                  </span>
                  <span className="font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                    {problem}
                  </span>
                </li>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <ScrollReveal chapterSeam respectEffectsGuard />
          <div className="mx-auto max-w-7xl">
            <ScrollReveal respectEffectsGuard>
              <h2 className="font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.95]">
                The approach
              </h2>
            </ScrollReveal>
            <ScrollReveal
              stagger
              respectEffectsGuard
              className="mt-8 border-t border-[var(--line)]"
            >
              {study.approach.map((block, index) => {
                const [rawNumber, ...rest] = block.title.split("—");
                const hasNumber = rest.length > 0;
                const stepNumber = hasNumber
                  ? (rawNumber ?? "").trim()
                  : String(index + 1).padStart(2, "0");
                const stepTitle = hasNumber ? rest.join("—").trim() : block.title;
                return (
                  <article
                    key={block.title}
                    className="grid gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6 md:py-8"
                  >
                    <span className="font-mono text-sm text-[var(--ink-faint)]">{stepNumber}</span>
                    <div className="min-w-0">
                      <h3 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-tight text-[var(--ink)]">
                        {stepTitle}
                      </h3>
                      <p className="mt-3 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                        {block.body}
                      </p>
                    </div>
                  </article>
                );
              })}
            </ScrollReveal>
          </div>
        </section>

        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <ScrollReveal chapterSeam respectEffectsGuard />
          <div className="mx-auto max-w-7xl">
            <ScrollReveal respectEffectsGuard>
              <h2 className="font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.95]">
                What it produces
              </h2>
              <p className="mt-4 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                Described in what changes, not in invented statistics. Performance numbers belong to
                real named projects — when a client shares theirs, they will appear here with their
                permission.
              </p>
            </ScrollReveal>
            <ScrollReveal stagger respectEffectsGuard className="mt-8 grid gap-4 sm:grid-cols-2">
              {study.outcomes.map((outcome) => (
                <div
                  key={outcome.title}
                  className="border border-[var(--line)] bg-[var(--ground-raised)] p-6"
                >
                  <h3 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-tight text-[var(--ink)]">
                    {outcome.title}
                  </h3>
                  <p className="mt-3 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                    {outcome.body}
                  </p>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <ScrollReveal chapterSeam respectEffectsGuard />
          <div className="mx-auto max-w-7xl">
            <ScrollReveal respectEffectsGuard>
              <h2 className="font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.95]">
                More studies
              </h2>
            </ScrollReveal>
            <ScrollReveal stagger respectEffectsGuard className="mt-8 grid gap-4 sm:grid-cols-2">
              {others.map((entry) => (
                <Link
                  key={entry.slug}
                  to="/work/$slug"
                  params={{ slug: entry.slug }}
                  className="group flex min-h-11 flex-col border border-[var(--line)] bg-[var(--ground-raised)] p-6 transition-colors hover:border-[var(--gold)]"
                >
                  <span className="font-mono text-xs tracking-widest text-[var(--gold)]">
                    CONCEPT STUDY · {entry.index}
                  </span>
                  <h3 className="mt-3 font-portfolio text-[length:var(--type-h3)] font-bold leading-tight text-[var(--ink)]">
                    {entry.name}
                  </h3>
                  <p className="mt-3 max-w-[68ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                    {entry.summary}
                  </p>
                  <span className="mt-auto pt-5 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors group-hover:text-[var(--gold)]">
                    READ THE STUDY
                  </span>
                </Link>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section className="relative px-[var(--gutter)] py-[var(--section-y)]">
          <ScrollReveal chapterSeam respectEffectsGuard />
          <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
            <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
              START THE SAME WAY
            </p>
            <h2 className="mt-4 max-w-4xl font-portfolio text-[length:var(--type-h2)] font-bold leading-[0.92]">
              Every project starts with the audit
            </h2>
            <p className="mt-4 max-w-[68ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
              Send your URL and I&apos;ll record a free 5-minute teardown of your homepage, mobile
              experience and conversion path.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-none bg-[var(--furnace)] px-7 font-mono text-xs font-bold tracking-widest text-[var(--ground)] hover:bg-[var(--furnace)]/90"
                >
                  <Link to="/audit">
                    <span className="magnetic-label inline-flex items-center gap-2">
                      GET A FREE AUDIT <ArrowUpRight />
                    </span>
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-none border-[var(--line)] bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-[var(--ink)] hover:border-[var(--gold)] hover:bg-transparent hover:text-[var(--gold)]"
                >
                  <Link to="/book">
                    <span className="magnetic-label">BOOK A FREE 15-MIN CALL</span>
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </>
  );
}
