import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { WorkGrid } from "@/components/WorkGrid";
import { studyDisclosure, WORK_STUDIES } from "@/lib/work-studies";

const TITLE = "Selected Work — The Roy Effect";
const DESCRIPTION =
  "Selected studio work across brand, UI/UX and no-code build by Houston creative director Rory Ulloa. Named client projects shown on the call, with permission.";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroyeffect.com/work" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://theroyeffect.com/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-[#030014] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Logo variant="compact" size="md" href="/" className="mb-12" />
        <span className="font-mono text-xs tracking-widest text-[#FF3333]">WORK</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">
          Work built around the next action
        </h1>
        <p className="mt-5 max-w-2xl font-mono text-base leading-[1.6] text-white/90">
          Selected studio work across brand, UI/UX and no-code build. Named client projects are
          shown on the call, with permission.
        </p>
        <div className="mt-12">
          <WorkGrid />
        </div>

        <section aria-labelledby="work-studies-heading" className="mt-20">
          <h2
            id="work-studies-heading"
            className="font-display text-2xl uppercase text-white md:text-3xl"
          >
            Concept studies
          </h2>
          <p className="mt-3 max-w-2xl font-mono text-[15px] leading-[1.6] text-white/90">
            Full write-ups of how the work runs, end to end — including one of my own builds.
          </p>
          <div className="mt-8 border-t border-white/10">
            {WORK_STUDIES.map((study) => (
              <Link
                key={study.slug}
                to="/work/$slug"
                params={{ slug: study.slug }}
                className="group block border-b border-white/10 px-1 py-6 transition-colors hover:bg-white/[0.04] md:px-4"
              >
                <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8">
                  <span className="font-mono text-xs tracking-widest text-[#DFBA73]">
                    {study.index}
                  </span>
                  <h3 className="font-display text-2xl uppercase text-white transition-colors group-hover:text-[#DFBA73] md:text-3xl">
                    {study.name}
                  </h3>
                  <p className="font-mono text-[15px] leading-[1.6] text-white/90">
                    {study.summary}
                  </p>
                </div>
                <p className="mt-3 font-mono text-xs leading-[1.6] text-white/60">
                  {studyDisclosure(study)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/audit"
            className="inline-flex min-h-11 items-center bg-[#FF3333] px-5 py-3 font-mono text-xs font-bold tracking-widest text-black"
          >
            GET YOUR FREE AUDIT
          </Link>
          <Link
            to="/book"
            className="inline-flex min-h-11 items-center border border-white/40 px-5 py-3 font-mono text-xs tracking-widest text-white"
          >
            BOOK A DISCOVERY CALL
          </Link>
        </div>
      </div>
    </main>
  );
}
