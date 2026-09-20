import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { RefineryScene } from "@/components/refinery/RefineryScene";
import { getPublicRedesign } from "@/utils/redesign-public.functions";

export const Route = createFileRoute("/redesign/$token")({
  loader: async ({ params }) => {
    const redesign = await getPublicRedesign({ data: { token: params.token } });
    if (!redesign) throw notFound();
    return redesign;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.businessName} — rebuilt by The Roy Effect`
          : "Rebuilt homepage | The Roy Effect",
      },
      {
        name: "description",
        content:
          "A rebuilt homepage concept from Houston designer Rory Ulloa at The Roy Effect — a real page, not a mockup.",
      },
      // Not a live site for this business: keep it out of search entirely.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RedesignPage,
  errorComponent: () => <RedesignMessage title="This page could not be loaded" />,
  notFoundComponent: () => <RedesignMessage title="This link is no longer active" />,
});

function RedesignMessage({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center text-[#f2eee6]">
      <Logo className="h-8 w-auto" />
      <h1 className="font-display text-2xl uppercase tracking-tight">{title}</h1>
      <Link
        to="/audit"
        className="inline-flex items-center gap-2 bg-[#ff3333] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black"
      >
        Request a free audit <ArrowRight className="size-4" />
      </Link>
    </main>
  );
}

function RedesignPage() {
  const { businessName, host, treatment, design, changes } = Route.useLoaderData();
  const { hero, palette, sections, footerNote, typePairing, brandNote } = design;

  // The generated palette drives the page through the same custom properties
  // the Refinery system uses; every value was hex-validated before storage.
  const themeVars = {
    "--ground": palette.ground,
    "--ink": palette.ink,
    "--gold": palette.gold,
    "--furnace": palette.accent,
  } as React.CSSProperties;

  return (
    <main
      style={themeVars}
      className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--ground)] text-[var(--ink)]"
    >
      {treatment === "cinematic_3d" ? <RefineryScene /> : null}

      {/* Concept banner — nobody should mistake this for their live site. */}
      <div className="relative z-30 border-b border-[var(--ink)]/12 bg-[var(--ground)]/90 px-[var(--gutter)] py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">
            Concept rebuild of {host} · not their live site
          </span>
          <a
            href="https://theroyeffect.com"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            The Roy Effect ↗
          </a>
        </div>
      </div>

      <section
        data-refinery-chapter="hero"
        className="relative z-20 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
      >
        <div className="mx-auto max-w-6xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--furnace)]">
            {hero.eyebrow}
          </span>
          <h1 className="mt-4 max-w-[22ch] font-display text-[var(--type-display)] uppercase leading-[0.9]">
            {hero.headline} <span className="text-[var(--gold)]">{hero.rotatingWords[0]}</span>
          </h1>
          <p className="mt-5 max-w-[58ch] text-[var(--type-lead)] leading-relaxed text-[var(--ink)]/80">
            {hero.subhead}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 bg-[var(--furnace)] px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black">
              {hero.primaryCta} <ArrowRight className="size-3.5" />
            </span>
            <span className="inline-flex items-center gap-2 border border-[var(--ink)]/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em]">
              <Phone className="size-3.5" /> {hero.secondaryCta}
            </span>
          </div>

          {hero.proofPoints.length > 0 && (
            <div className="mt-12 grid gap-px border-t border-[var(--ink)]/12 sm:grid-cols-3">
              {hero.proofPoints.map((point) => (
                <div key={point} className="border-b border-[var(--ink)]/12 py-5 pr-6">
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--ink)]/70">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={`${section.key}-${index}`}
          id={index === 0 ? "services" : undefined}
          data-refinery-chapter={index === 0 ? "services" : index === 1 ? "promise" : "about"}
          className="relative z-20 border-t border-[var(--ink)]/12 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
        >
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
                {String(index + 1).padStart(2, "0")} {section.key}
              </span>
              <h2 className="mt-3 font-display text-[var(--type-h3)] uppercase leading-tight">
                {section.heading}
              </h2>
            </div>
            <div className="md:col-span-8">
              {section.body && (
                <p className="max-w-[60ch] text-[var(--type-lead)] leading-relaxed text-[var(--ink)]/80">
                  {section.body}
                </p>
              )}
              {section.items.length > 0 && (
                <ul className="mt-7 grid gap-px border-t border-[var(--ink)]/12">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      data-refinery-row
                      className="flex items-baseline gap-4 border-b border-[var(--ink)]/12 py-4"
                    >
                      <span className="font-mono text-[11px] text-[var(--gold)]">—</span>
                      <span className="text-[15px] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ))}

      {changes.length > 0 && (
        <section
          data-refinery-chapter="finale"
          className="relative z-20 border-t border-[var(--ink)]/12 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
        >
          <div className="mx-auto max-w-6xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--furnace)]">
              What changed
            </span>
            <div className="mt-7 grid gap-px border-t border-[var(--ink)]/12">
              {changes.map((change) => (
                <div
                  key={change.index}
                  className="flex items-baseline gap-5 border-b border-[var(--ink)]/12 py-5"
                >
                  <span className="font-mono text-[12px] text-[var(--gold)]">{change.index}</span>
                  <p className="max-w-[62ch] text-[16px] leading-relaxed">{change.text}</p>
                </div>
              ))}
            </div>
            {brandNote && (
              <p className="mt-8 max-w-[62ch] font-mono text-[12px] leading-relaxed text-[var(--ink)]/55">
                Direction: {brandNote} Type: {typePairing.display} / {typePairing.body} /{" "}
                {typePairing.mono}.
              </p>
            )}
          </div>
        </section>
      )}

      <footer className="relative z-20 border-t border-[var(--furnace)] bg-[var(--ground)] px-[var(--gutter)] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg uppercase">{businessName}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]/55">
              {footerNote}
            </p>
          </div>
          <a
            href="https://theroyeffect.com"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            Rebuilt by The Roy Effect <ArrowRight className="size-3.5" />
          </a>
        </div>
      </footer>
    </main>
  );
}
