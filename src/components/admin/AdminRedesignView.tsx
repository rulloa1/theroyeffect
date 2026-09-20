import { useState } from "react";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import type {
  RedesignAngle,
  RedesignRun,
  RedesignStatus,
  RedesignTreatment,
} from "@/utils/redesign.functions";

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

const STATUS_LABEL: Record<RedesignStatus, string> = {
  draft: "DRAFT",
  pitch_sent: "PITCH SENT",
  archived: "ARCHIVED",
  failed: "FAILED",
};

const STATUS_COLOR: Record<RedesignStatus, string> = {
  draft: "text-[#DFBA73]",
  pitch_sent: "text-emerald-400",
  archived: "text-white/40",
  failed: "text-[#FF3333]",
};

function labelFor(list: { id: string; label: string }[], id: string) {
  return list.find((item) => item.id === id)?.label ?? id.toUpperCase();
}

interface Props {
  runs: RedesignRun[];
  busy: string | null;
  onRun: (input: { url: string; treatment: RedesignTreatment; angle: RedesignAngle }) => void;
  onSetStatus: (id: string, status: RedesignStatus) => void;
  onDelete: (id: string) => void;
  onCall?: (run: RedesignRun) => void;
  date: (value: string) => string;
}

export function AdminRedesignView({
  runs,
  busy,
  onRun,
  onSetStatus,
  onDelete,
  onCall,
  date,
}: Props) {
  const [url, setUrl] = useState("");
  const [treatment, setTreatment] = useState<RedesignTreatment>("cinematic_3d");
  const [angle, setAngle] = useState<RedesignAngle>("lost_enquiries");
  const [open, setOpen] = useState<RedesignRun | null>(null);

  const running = busy === "redesign-run";

  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF3333]">
        Redesign &amp; Pitch Studio
      </span>
      <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-white md:text-5xl">
        TURN ANY URL INTO A PITCH
      </h2>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-white/60">
        Drop in a prospect&apos;s website. I&apos;ll capture it, rebuild the homepage in the
        cinematic system, and draft the outreach that goes with it.
      </p>

      <form
        className="mt-8 max-w-3xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (!url.trim() || running) return;
          onRun({ url: url.trim(), treatment, angle });
        }}
      >
        <label
          htmlFor="redesign-url"
          className="font-mono text-[10px] uppercase tracking-widest text-white/40"
        >
          Prospect URL
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="redesign-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="whitfieldplumbing.com"
            autoComplete="url"
            className="flex-1 border border-white/15 bg-white/[0.02] px-5 py-4 font-mono text-sm text-white placeholder:text-white/25 focus:border-[#FF3333] focus:outline-none"
          />
          <button
            type="submit"
            disabled={running || !url.trim()}
            className="flex items-center justify-center gap-2 bg-[#FF3333] px-7 py-4 font-mono text-xs font-bold tracking-widest text-black transition-opacity disabled:opacity-50"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {running ? "RUNNING…" : "RUN REDESIGN ↗"}
          </button>
        </div>

        <fieldset className="mt-6">
          <legend className="font-mono text-[10px] uppercase tracking-widest text-white/40">
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
                    ? "border-white bg-white/10 font-bold text-white"
                    : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Pitch angle
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
                    ? "border-white bg-white/10 font-bold text-white"
                    : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="mt-12 border-t border-white/10 pt-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Recent runs
        </span>

        {runs.length === 0 && (
          <p className="mt-6 font-mono text-xs text-white/40">
            No runs yet. Drop a URL above to make the first pitch.
          </p>
        )}

        <div className="mt-4 divide-y divide-white/10 border-t border-white/10">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 md:flex-1">
                <p className="truncate font-mono text-sm text-white">{run.host}</p>
                <p className="truncate font-mono text-[10px] text-white/40">
                  {date(run.created_at)}
                  {run.headline ? ` · ${run.headline}` : ""}
                </p>
              </div>
              <span className="font-mono text-[11px] tracking-widest text-white/50 md:w-44">
                {labelFor(TREATMENTS, run.treatment)}
              </span>
              <span
                className={`font-mono text-[11px] tracking-widest md:w-28 ${STATUS_COLOR[run.status]}`}
              >
                {STATUS_LABEL[run.status]}
              </span>
              <div className="flex items-center gap-4">
                {onCall && run.status !== "failed" && (
                  <button
                    type="button"
                    onClick={() => onCall(run)}
                    className="font-mono text-[11px] tracking-widest text-white/50 hover:text-white"
                  >
                    CALL
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(run)}
                  className="flex items-center gap-1 font-mono text-[11px] tracking-widest text-[#DFBA73] hover:text-white"
                >
                  OPEN <ArrowUpRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#07031a] p-6 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#FF3333]">
                  {labelFor(TREATMENTS, open.treatment)} · {labelFor(ANGLES, open.angle)}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight text-white">
                  {open.headline ?? open.host}
                </h3>
                <p className="mt-2 font-mono text-[11px] text-white/40">{open.url}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="text-white/50 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {open.error_message && (
              <p className="mt-6 border border-[#FF3333]/40 bg-[#FF3333]/10 p-4 font-mono text-xs text-[#FF3333]">
                {open.error_message}
              </p>
            )}

            {open.subheadline && (
              <p className="mt-6 text-sm leading-relaxed text-white/70">{open.subheadline}</p>
            )}

            {open.sections.map((section) => (
              <div key={section.title} className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {section.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{section.body}</p>
              </div>
            ))}

            {open.outreach_body && (
              <div className="mt-10 border border-white/10 bg-white/[0.02] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Outreach draft
                </p>
                <p className="mt-3 font-mono text-xs text-white">{open.outreach_subject}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                  {open.outreach_body}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      `${open.outreach_subject ?? ""}\n\n${open.outreach_body ?? ""}`,
                    )
                  }
                  className="mt-4 border border-white/15 px-4 py-2 font-mono text-[11px] tracking-widest text-white/60 hover:border-white/40 hover:text-white"
                >
                  COPY EMAIL
                </button>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              {(["draft", "pitch_sent", "archived"] as RedesignStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onSetStatus(open.id, status);
                    setOpen({ ...open, status });
                  }}
                  className={`border px-4 py-2.5 font-mono text-[11px] tracking-widest ${
                    open.status === status
                      ? "border-white bg-white/10 text-white"
                      : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  onDelete(open.id);
                  setOpen(null);
                }}
                className="ml-auto border border-[#FF3333]/40 px-4 py-2.5 font-mono text-[11px] tracking-widest text-[#FF3333] hover:bg-[#FF3333]/10"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
