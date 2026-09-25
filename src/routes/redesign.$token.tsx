import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
          ? `${loaderData.host} — a redesign concept | The Roy Effect`
          : "Redesign concept | The Roy Effect",
      },
      {
        name: "description",
        content: "A homepage redesign concept from Houston designer Rory Ulloa at The Roy Effect.",
      },
      // This is not the business's live site: keep it out of search entirely.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RedesignPage,
  errorComponent: () => <RedesignMessage title="This page could not be loaded" />,
  notFoundComponent: () => <RedesignMessage title="This link is no longer active" />,
});

function RedesignMessage({ title }: { title: string }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--ground)] px-6 text-center text-[var(--ink)]"
    >
      <Logo className="h-8 w-auto" />
      <h1 className="font-display text-2xl uppercase tracking-tight">{title}</h1>
      <Link
        to="/audit"
        className="inline-flex items-center gap-2 bg-[var(--furnace)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black"
      >
        Request a free audit <ArrowRight className="size-4" />
      </Link>
    </main>
  );
}

function RedesignPage() {
  const { host, treatment, headline, subheadline, sections } = Route.useLoaderData();

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--ground)] text-[var(--ink)]"
    >
      {treatment === "cinematic_3d" ? <RefineryScene /> : null}

      {/* Concept banner — nobody should mistake this for their live site. */}
      <div className="relative z-30 border-b border-[var(--line)] bg-[var(--ground)]/90 px-[var(--gutter)] py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            A redesign concept for {host} · not their live site
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
            The redesign
          </span>
          <h1 className="mt-4 max-w-[24ch] font-display text-[var(--type-display)] uppercase leading-[0.9]">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-5 max-w-[58ch] text-[var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
              {subheadline}
            </p>
          )}
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={`${section.title}-${index}`}
          id={index === 0 ? "services" : undefined}
          data-refinery-chapter={index === 0 ? "services" : index === 1 ? "promise" : "about"}
          className="relative z-20 border-t border-[var(--line)] bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
        >
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3 font-display text-[var(--type-h3)] uppercase leading-tight">
                {section.title}
              </h2>
            </div>
            <div className="md:col-span-8">
              <p className="max-w-[62ch] text-[var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
                {section.body}
              </p>
            </div>
          </div>
        </section>
      ))}

      <footer className="relative z-20 border-t border-[var(--furnace)] bg-[var(--ground)] px-[var(--gutter)] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <Logo className="h-6 w-auto" />
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Concept by Rory Ulloa · Houston, TX
            </p>
          </div>
          <a
            href="https://theroyeffect.com"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            See the studio <ArrowRight className="size-3.5" />
          </a>
        </div>
      </footer>
    </main>
  );
}
