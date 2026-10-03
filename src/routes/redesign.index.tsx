import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { runPublicRedesign } from "@/utils/redesign-public.functions";
import type { RedesignAngle, RedesignTreatment } from "@/utils/redesign.functions";

export const Route = createFileRoute("/redesign/")({
  head: () => ({
    meta: [
      { title: "Website redesign generator | The Roy Effect" },
      {
        name: "description",
        content:
          "Drop in your website URL and get a redesign concept for it in about a minute, from Houston designer Rory Ulloa at The Roy Effect.",
      },
      { property: "og:title", content: "Website redesign generator | The Roy Effect" },
      {
        property: "og:description",
        content: "Drop in your website URL and get a redesign concept for it in about a minute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RedesignGeneratorPage,
});

const TREATMENTS: { id: RedesignTreatment; label: string }[] = [
  { id: "cinematic", label: "CINEMATIC" },
  { id: "cinematic_3d", label: "CINEMATIC + 3D" },
  { id: "editorial", label: "EDITORIAL" },
];

const ANGLES: { id: RedesignAngle; label: string }[] = [
  { id: "lost_enquiries", label: "LOST ENQUIRIES" },
  { id: "looks_dated", label: "LOOKS DATED" },
  { id: "slow_on_mobile", label: "SLOW ON MOBILE" },
];

function RedesignGeneratorPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [treatment, setTreatment] = useState<RedesignTreatment>("cinematic_3d");
  const [angle, setAngle] = useState<RedesignAngle>("lost_enquiries");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await runPublicRedesign({
        data: { url: url.trim(), treatment, angle, email: email.trim() || undefined },
      });
      if ("error" in result) {
        setError(result.error);
        setBusy(false);
        return;
      }
      await navigate({ to: "/redesign/$token", params: { token: result.token } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The redesign run failed. Try again.");
      setBusy(false);
    }
  };

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-[var(--ground)] text-[var(--ink)]"
    >
      <header className="border-b border-[var(--line)] px-[var(--gutter)] py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo className="h-7 w-auto" />
          <a
            href="https://theroyeffect.com"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            The Roy Effect ↗
          </a>
        </div>
      </header>

      <section className="px-[var(--gutter)] py-[var(--section-y)]">
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--furnace)]">
            Redesign generator
          </span>
          <h1 className="mt-4 font-display text-[var(--type-display)] uppercase leading-[0.9]">
            See your website redesigned
          </h1>
          <p className="mt-5 max-w-[52ch] text-[var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
            Drop in your current site. I scan it, write the redesign pitch in my cinematic
            system, and hand you a concept page you can keep. About a minute, free, no email
            required.
          </p>

          <form onSubmit={submit} className="mt-10">
            <label
              htmlFor="redesign-url"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-faint)]"
            >
              Your website
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="redesign-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="yourbusiness.com"
                autoComplete="url"
                className="flex-1 border border-[var(--line)] bg-transparent px-5 py-4 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--furnace)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !url.trim()}
                className="flex items-center justify-center gap-2 bg-[var(--furnace)] px-7 py-4 font-mono text-xs font-bold uppercase tracking-widest text-black transition-opacity disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {busy ? "Running…" : "Run my redesign"}
                {!busy ? <ArrowRight className="size-3.5" /> : null}
              </button>
            </div>

            <label
              htmlFor="redesign-email"
              className="mt-6 block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-faint)]"
            >
              Your email (optional, so I can send you the full pitch)
            </label>
            <input
              id="redesign-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourbusiness.com"
              autoComplete="email"
              className="mt-2 w-full border border-[var(--line)] bg-transparent px-5 py-4 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--furnace)] focus:outline-none"
            />


            <fieldset className="mt-8">
              <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                Treatment
              </legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {TREATMENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={treatment === item.id}
                    onClick={() => setTreatment(item.id)}
                    className={`border px-4 py-2.5 font-mono text-[11px] tracking-widest transition-colors ${
                      treatment === item.id
                        ? "border-[var(--ink)] bg-[var(--ink)]/10 font-bold text-[var(--ink)]"
                        : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                What to lead with
              </legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {ANGLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={angle === item.id}
                    onClick={() => setAngle(item.id)}
                    className={`border px-4 py-2.5 font-mono text-[11px] tracking-widest transition-colors ${
                      angle === item.id
                        ? "border-[var(--ink)] bg-[var(--ink)]/10 font-bold text-[var(--ink)]"
                        : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="mt-6 border border-[var(--furnace)]/40 bg-[var(--furnace)]/10 p-4 font-mono text-xs text-[var(--furnace)]">
                {error}
              </p>
            )}
          </form>
        </div>
      </section>

      <footer className="mt-auto border-t border-[var(--line)] px-[var(--gutter)] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Concept by Rory Ulloa · Houston, TX
          </p>
          <a
            href="https://theroyeffect.com/book"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            Book a call ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
