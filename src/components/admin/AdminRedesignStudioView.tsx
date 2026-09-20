import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Send,
  Wand2,
  X,
} from "lucide-react";
import { SITE_URL } from "@/lib/site";
import {
  PIPELINE_STEPS,
  PITCH_ANGLES,
  STEP_COUNT,
  TREATMENTS,
  stepLabel,
  treatmentLabel,
} from "@/lib/redesign/types";
import type { PitchAngle, PitchTone, RedesignRun, Treatment } from "@/lib/redesign/types";

export interface AdminRedesignStudioViewProps {
  runs: RedesignRun[];
  busy: string | null;
  onStart: (
    url: string,
    treatment: Treatment,
    pitchAngle: PitchAngle,
  ) => Promise<RedesignRun | null>;
  onAdvance: (id: string) => Promise<RedesignRun | null>;
  onCancel: (id: string) => Promise<void>;
  onRerun: (id: string) => Promise<RedesignRun | null>;
  onRegeneratePitch: (id: string, tone: PitchTone | null) => Promise<void>;
  onSavePitch: (
    id: string,
    subject: string,
    body: string,
    contactEmail: string | null,
  ) => Promise<void>;
  onSend: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onExportPdf: (id: string) => Promise<void>;
  onOpenLeadPipeline: () => void;
  date: (value: string | null) => string;
}

const TONES: { key: PitchTone; label: string }[] = [
  { key: "shorter", label: "Shorter" },
  { key: "warmer", label: "Warmer" },
  { key: "more_direct", label: "More direct" },
  { key: "add_pricing", label: "Add pricing" },
];

type PreviewTab = "redesign" | "side_by_side" | "scene" | "mobile";

const chipOn =
  "bg-white px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black";
const chipOff =
  "border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/40 hover:text-white";
const ghostButton =
  "inline-flex items-center gap-2 border border-white/15 px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40";
const dangerButton =
  "inline-flex items-center gap-2 bg-[#FF3333] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90 disabled:opacity-40";
const label = "font-mono text-[10px] uppercase tracking-[0.18em] text-white/50";

const runStatusTone = (run: RedesignRun) => {
  if (run.pitch_status === "sent") return "text-emerald-400";
  if (run.status === "failed") return "text-[#FF3333]";
  if (run.status === "running" || run.status === "queued") return "text-sky-300";
  if (run.status === "archived" || run.status === "cancelled") return "text-white/40";
  return "text-[#dfba73]";
};

const runStatusText = (run: RedesignRun) => {
  if (run.pitch_status === "sent") return "Pitch sent";
  if (run.status === "failed") return "Failed";
  if (run.status === "running" || run.status === "queued") return "Running";
  if (run.status === "archived") return "Archived";
  if (run.status === "cancelled") return "Cancelled";
  if (run.pitch_status === "draft") return "Draft";
  return "Complete";
};

/**
 * A scaled-down live preview: the page rendered at a desktop width, then scaled
 * to fit the frame. The redesign is our own page so it always frames; a
 * prospect's site may refuse via X-Frame-Options, which cannot be detected
 * cross-origin (the browser fires `load` for the refusal too), so the caller
 * offers the captured-content view as an explicit alternative rather than
 * guessing.
 */
function FramePreview({
  src,
  logicalWidth,
  title,
  sameOrigin = false,
}: {
  src: string;
  logicalWidth: number;
  title: string;
  sameOrigin?: boolean;
}) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const measure = () => setScale(element.clientWidth / logicalWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [logicalWidth]);

  return (
    <div ref={wrapper} className="absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        // Our own page needs same-origin to render; a prospect's does not.
        sandbox={sameOrigin ? "allow-scripts allow-same-origin" : "allow-scripts"}
        referrerPolicy="no-referrer"
        tabIndex={-1}
        className="pointer-events-none border-0 bg-white"
        style={{
          width: logicalWidth,
          height: logicalWidth * 1.45,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}

/** What their current site says, for when it refuses to be framed. */
function CaptureFallback({ run }: { run: RedesignRun }) {
  const capture = run.capture;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0620] p-5">
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
        Captured from {run.host}
      </div>
      {capture?.title && (
        <p className="mt-3 font-display text-lg leading-tight text-white/90">{capture.title}</p>
      )}
      {capture?.metaDescription && (
        <p className="mt-2 text-xs leading-relaxed text-white/60">{capture.metaDescription}</p>
      )}
      {capture?.headings?.length ? (
        <ul className="mt-4 grid gap-1.5">
          {capture.headings.slice(0, 5).map((heading) => (
            <li key={heading} className="truncate font-mono text-[11px] text-white/55">
              — {heading}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminRedesignStudioView({
  runs,
  busy,
  onStart,
  onAdvance,
  onCancel,
  onRerun,
  onRegeneratePitch,
  onSavePitch,
  onSend,
  onArchive,
  onExportPdf,
  onOpenLeadPipeline,
  date,
}: AdminRedesignStudioViewProps) {
  const [url, setUrl] = useState("");
  const [treatment, setTreatment] = useState<Treatment>("cinematic");
  const [angle, setAngle] = useState<PitchAngle>("lost_enquiries");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("redesign");
  const [seam, setSeam] = useState(52);
  const [showCapture, setShowCapture] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [editingPitch, setEditingPitch] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const activeRun = useMemo(
    () => runs.find((run) => run.id === activeRunId) ?? null,
    [runs, activeRunId],
  );

  const recentRuns = useMemo(
    () => runs.filter((run) => run.status !== "archived").slice(0, 6),
    [runs],
  );

  const isRunning = activeRun?.status === "running" || activeRun?.status === "queued";

  // Drive the pipeline: one step per request, never two in flight at once.
  const advancing = useRef(false);
  useEffect(() => {
    if (!activeRun || !isRunning || advancing.current) return;
    advancing.current = true;
    void (async () => {
      try {
        await onAdvance(activeRun.id);
      } finally {
        // Cleared only when the request settles. Clearing it on cleanup would
        // let an unrelated re-render start a second step mid-flight.
        advancing.current = false;
      }
    })();
  }, [activeRun, isRunning, onAdvance]);

  const shareUrl = activeRun ? `${SITE_URL}/redesign/${activeRun.share_token}` : "";

  const startRun = useCallback(async () => {
    if (!url.trim()) return;
    const run = await onStart(url.trim(), treatment, angle);
    if (run) {
      setActiveRunId(run.id);
      setUrl("");
      setPreviewTab("redesign");
      setSeam(52);
      setActiveSection(0);
    }
  }, [url, treatment, angle, onStart]);

  const openRun = (run: RedesignRun) => {
    setActiveRunId(run.id);
    setPreviewTab("redesign");
    setSeam(52);
    setActiveSection(0);
    setEditingPitch(false);
  };

  const beginEdit = (run: RedesignRun) => {
    setDraftSubject(run.pitch_subject ?? "");
    setDraftBody(run.pitch_body ?? "");
    setDraftEmail(run.contact_email ?? "");
    setEditingPitch(true);
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  // ---------------------------------------------------------------- state 1
  if (!activeRun) {
    return (
      <div className="pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF3333]">
          Redesign &amp; Pitch Studio
        </span>
        <h1 className="mt-2.5 max-w-[22ch] font-display text-4xl uppercase leading-[0.9] text-white md:text-5xl">
          Turn any URL into a pitch
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-white/90">
          Drop in a prospect&apos;s website. I&apos;ll capture it, rebuild the homepage in the
          cinematic system, and draft the outreach that goes with it.
        </p>

        <div className="mt-8 max-w-[640px]">
          <div className={label}>Prospect URL</div>
          <div className="mt-2 flex flex-col sm:flex-row">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void startRun();
              }}
              placeholder="whitfieldplumbing.com"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 border border-white/15 bg-transparent px-4 py-3.5 font-mono text-[15px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none sm:border-r-0"
            />
            <button
              type="button"
              onClick={() => void startRun()}
              disabled={!url.trim() || busy === "redesign-start"}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-[#FF3333] px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {busy === "redesign-start" ? "Starting…" : "Run redesign"}
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-7 grid max-w-[640px] gap-3.5">
          <div>
            <div className={label}>Treatment</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TREATMENTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTreatment(option.key)}
                  className={treatment === option.key ? chipOn : chipOff}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={label}>Pitch angle</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PITCH_ANGLES.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAngle(option.key)}
                  className={angle === option.key ? chipOn : chipOff}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className={label}>Recent runs</div>
          {recentRuns.length === 0 ? (
            <p className="mt-4 font-mono text-xs text-white/40">
              No runs yet. Drop a URL in above.
            </p>
          ) : (
            <div className="mt-3.5 border-t border-white/10">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => openRun(run)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-white/10 py-3.5 text-left font-mono text-xs text-white/85 transition-colors hover:text-white sm:grid-cols-[1fr_130px_130px_90px] sm:gap-4"
                >
                  <span className="truncate">{run.host}</span>
                  <span className="hidden text-white/50 sm:block">
                    {treatmentLabel(run.treatment)}
                  </span>
                  <span className={runStatusTone(run)}>{runStatusText(run)}</span>
                  <span className="hidden items-center gap-1 text-[#dfba73] sm:flex">
                    Open <ArrowUpRight className="size-3" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------- state 2: running
  if (isRunning || activeRun.status === "failed") {
    const failed = activeRun.status === "failed";
    const currentStep = PIPELINE_STEPS[Math.min(activeRun.step, STEP_COUNT - 1)]!;

    return (
      <div className="pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                failed ? "text-[#FF3333]" : "text-[#FF3333]"
              }`}
            >
              {failed ? "Run failed" : "Running"} · {treatmentLabel(activeRun.treatment)}
            </span>
            <h2 className="mt-2 font-display text-3xl uppercase text-white">{activeRun.host}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {failed ? (
              <button
                type="button"
                onClick={() => void onRerun(activeRun.id)}
                disabled={busy === `redesign-rerun-${activeRun.id}`}
                className={ghostButton}
              >
                <RotateCcw className="size-3.5" /> Re-run
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onCancel(activeRun.id)}
                disabled={busy === `redesign-cancel-${activeRun.id}`}
                className={ghostButton}
              >
                <X className="size-3.5" /> Cancel run
              </button>
            )}
            <button type="button" onClick={() => setActiveRunId(null)} className={ghostButton}>
              Back to studio
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="relative overflow-hidden border border-white/10 bg-[#0a0620]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 9px)",
              }}
            />
            <div className="relative flex aspect-video flex-col items-center justify-center gap-3.5 px-6 text-center">
              {failed ? (
                <>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF3333]">
                    {stepLabel(currentStep.key, activeRun.treatment)} failed
                  </span>
                  <p className="max-w-[46ch] text-sm leading-relaxed text-white/70">
                    {activeRun.error ?? "That step could not be completed."}
                  </p>
                </>
              ) : (
                <>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#dfba73]">
                    {stepLabel(currentStep.key, activeRun.treatment)}
                  </span>
                  <div className="h-0.5 w-[280px] max-w-full bg-white/10">
                    <div
                      className="h-0.5 bg-[#FF3333] transition-[width] duration-700"
                      style={{ width: `${Math.max(activeRun.progress, 4)}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-white/40">
                    {activeRun.progress}% · step {Math.min(activeRun.step + 1, STEP_COUNT)} of{" "}
                    {STEP_COUNT}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border border-white/10 p-4.5">
            <div className={label}>Pipeline</div>
            <div className="mt-3.5 grid font-mono text-xs">
              {PIPELINE_STEPS.map((step, index) => {
                const done = index < activeRun.step;
                const active = index === activeRun.step && !failed;
                const errored = index === activeRun.step && failed;
                return (
                  <div
                    key={step.key}
                    className={`flex items-center justify-between gap-3 border-b border-white/[0.08] py-2.5 last:border-b-0 ${
                      done
                        ? "text-white/85"
                        : active
                          ? "text-[#dfba73]"
                          : errored
                            ? "text-[#FF3333]"
                            : "text-white/40"
                    }`}
                  >
                    <span>{stepLabel(step.key, activeRun.treatment)}</span>
                    <span>{done ? "✓" : active ? "●" : errored ? "✕" : "—"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/60">
              Every step is saved as it finishes, so a run you leave picks up from Recent Runs where
              it stopped.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------- state 3: result + pitch
  const design = activeRun.design;
  const sections = design?.sections ?? [];
  const sent = activeRun.pitch_status === "sent";

  return (
    <div className="pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
              sent ? "text-emerald-400" : "text-emerald-400"
            }`}
          >
            Run complete · {treatmentLabel(activeRun.treatment)}
          </span>
          <h2 className="mt-1.5 font-display text-2xl uppercase text-white md:text-3xl">
            {activeRun.host}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveRunId(null)} className={ghostButton}>
            Back to studio
          </button>
          <button
            type="button"
            onClick={() => void onRerun(activeRun.id)}
            disabled={sent || busy === `redesign-rerun-${activeRun.id}`}
            title={sent ? "This pitch has already been sent" : undefined}
            className={ghostButton}
          >
            <RotateCcw className="size-3.5" /> Re-run
          </button>
          <button
            type="button"
            onClick={() => void onExportPdf(activeRun.id)}
            disabled={busy === `redesign-pdf-${activeRun.id}`}
            className={ghostButton}
          >
            <Download className="size-3.5" /> Export PDF
          </button>
          <button
            type="button"
            onClick={() => void onSend(activeRun.id)}
            disabled={sent || !activeRun.contact_email || busy === `redesign-send-${activeRun.id}`}
            title={!activeRun.contact_email ? "Add a recipient address first" : undefined}
            className={dangerButton}
          >
            {sent ? "Pitch sent" : "Send pitch"}
            {!sent && <Send className="size-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[1fr_420px]">
        <div className="py-5 xl:border-r xl:border-white/10 xl:pr-5">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["redesign", "Redesign"],
                ["side_by_side", "Side by side"],
                ["scene", "3D scene"],
                ["mobile", "Mobile"],
              ] as [PreviewTab, string][]
            ).map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreviewTab(key)}
                className={previewTab === key ? chipOn : chipOff}
              >
                {text}
              </button>
            ))}
          </div>

          {/* Comparison frame. The redesign is a live page, not an image. */}
          <div className="relative mt-4 aspect-[16/10] overflow-hidden border border-white/10 bg-[#0a0620]">
            {previewTab === "side_by_side" ? (
              <div className="absolute inset-0 grid grid-cols-2 gap-px">
                <div className="relative overflow-hidden">
                  <FramePreview
                    src={shareUrl}
                    logicalWidth={1440}
                    title="Redesign preview"
                    sameOrigin
                  />
                  <span className="absolute left-3 top-3 bg-[#030014]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#dfba73]">
                    Redesign
                  </span>
                </div>
                <div className="relative overflow-hidden border-l border-white/10">
                  {showCapture ? (
                    <CaptureFallback run={activeRun} />
                  ) : (
                    <FramePreview
                      src={activeRun.url}
                      logicalWidth={1440}
                      title="Their site today"
                    />
                  )}
                  <span className="absolute left-3 top-3 bg-[#030014]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                    Their site today
                  </span>
                </div>
              </div>
            ) : previewTab === "mobile" ? (
              <div className="absolute inset-0 flex items-start justify-center overflow-hidden bg-[#0a0620] py-4">
                <div className="relative h-full w-[190px] overflow-hidden border border-white/15">
                  <FramePreview
                    src={shareUrl}
                    logicalWidth={390}
                    title="Redesign on mobile"
                    sameOrigin
                  />
                </div>
              </div>
            ) : previewTab === "scene" ? (
              <>
                <FramePreview
                  src={shareUrl}
                  logicalWidth={1440}
                  title="Redesign 3D scene"
                  sameOrigin
                />
                {activeRun.treatment !== "cinematic_3d" && (
                  <span className="absolute bottom-3 left-3 bg-[#030014]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60">
                    This run used {treatmentLabel(activeRun.treatment)} — no 3D scene
                  </span>
                )}
              </>
            ) : (
              <>
                {/* Draggable before/after seam: their site is layered over the
                    redesign and clipped to the right of the handle. */}
                <FramePreview
                  src={shareUrl}
                  logicalWidth={1440}
                  title="Redesign preview"
                  sameOrigin
                />
                <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${seam}%)` }}>
                  {showCapture ? (
                    <CaptureFallback run={activeRun} />
                  ) : (
                    <FramePreview
                      src={activeRun.url}
                      logicalWidth={1440}
                      title="Their site today"
                    />
                  )}
                </div>
                <span className="absolute left-3.5 top-3.5 bg-[#030014]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#dfba73]">
                  Redesign
                </span>
                <span className="absolute right-3.5 top-3.5 bg-[#030014]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                  Their site today
                </span>
                <div
                  className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#dfba73]"
                  style={{ left: `${seam}%` }}
                />
                <label className="sr-only" htmlFor="redesign-seam">
                  Before and after comparison position
                </label>
                <input
                  id="redesign-seam"
                  type="range"
                  min={4}
                  max={96}
                  value={seam}
                  onChange={(event) => setSeam(Number(event.target.value))}
                  className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
                />
                <div
                  className="pointer-events-none absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#dfba73] bg-[#030014] font-mono text-[13px] text-[#dfba73]"
                  style={{ left: `${seam}%` }}
                >
                  ‹›
                </div>
              </>
            )}
          </div>

          {previewTab === "redesign" || previewTab === "side_by_side" ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                Drag the handle to compare
              </span>
              <button
                type="button"
                onClick={() => setShowCapture((value) => !value)}
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#dfba73] transition-opacity hover:opacity-80"
              >
                {showCapture ? "Show their live site" : "Their site blank? Show captured content"}
              </button>
            </div>
          ) : null}

          {/* Section rail */}
          {sections.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sections.slice(0, 4).map((section, index) => (
                <button
                  key={`${section.key}-${index}`}
                  type="button"
                  onClick={() => setActiveSection(index)}
                  className={`flex aspect-[16/10] items-end bg-[#0a0620] p-1.5 text-left transition-colors ${
                    activeSection === index
                      ? "border border-[#dfba73]"
                      : "border border-white/10 hover:border-white/30"
                  }`}
                >
                  <span
                    className={`truncate font-mono text-[8px] uppercase tracking-[0.12em] ${
                      activeSection === index ? "text-[#dfba73]" : "text-white/50"
                    }`}
                  >
                    {section.key}
                  </span>
                </button>
              ))}
            </div>
          )}

          {sections[activeSection] && (
            <div className="mt-4 border border-white/10 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#dfba73]">
                {sections[activeSection]!.key}
              </div>
              <p className="mt-2 font-display text-lg uppercase leading-tight text-white">
                {sections[activeSection]!.heading}
              </p>
              {sections[activeSection]!.body && (
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {sections[activeSection]!.body}
                </p>
              )}
            </div>
          )}

          {activeRun.changes?.length ? (
            <div className="mt-5 border border-white/10 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF3333]">
                What I changed
              </div>
              <div className="mt-3 grid gap-2.5">
                {activeRun.changes.map((change) => (
                  <div key={change.index} className="flex gap-2.5">
                    <span className="font-mono text-[11px] text-[#dfba73]">{change.index}</span>
                    <span className="text-sm leading-relaxed text-white/90">{change.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeRun.audit && (
            <div className="mt-5 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Measured on their site
                </div>
                <span className="font-mono text-[11px] text-[#FF3333]">
                  Pain score {activeRun.audit.score}
                </span>
              </div>
              <div className="mt-3 grid gap-1.5">
                {activeRun.audit.signals.slice(0, 4).map((signal) => (
                  <div key={signal.code} className="font-mono text-[11px] text-white/60">
                    — {signal.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------ pitch panel */}
        <div className="border-t border-white/10 py-5 xl:border-t-0 xl:pl-5">
          <div className="flex items-center justify-between">
            <div className={label}>Generated pitch</div>
            <button
              type="button"
              onClick={() => void onRegeneratePitch(activeRun.id, null)}
              disabled={busy === `redesign-pitch-${activeRun.id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#dfba73] transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              Regenerate <RefreshCw className="size-3" />
            </button>
          </div>

          <div className="mt-3 border border-white/10">
            {editingPitch ? (
              <div className="grid gap-3 p-4">
                <div>
                  <div className={label}>To</div>
                  <input
                    value={draftEmail}
                    onChange={(event) => setDraftEmail(event.target.value)}
                    placeholder="name@business.com"
                    className="mt-1.5 w-full border border-white/15 bg-transparent px-3 py-2 font-mono text-xs text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div>
                  <div className={label}>Subject</div>
                  <input
                    value={draftSubject}
                    onChange={(event) => setDraftSubject(event.target.value)}
                    className="mt-1.5 w-full border border-white/15 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div>
                  <div className={label}>Body</div>
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    rows={12}
                    className="mt-1.5 w-full resize-y border border-white/15 bg-transparent px-3 py-2 text-sm leading-relaxed text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await onSavePitch(
                        activeRun.id,
                        draftSubject,
                        draftBody,
                        draftEmail.trim() || null,
                      );
                      setEditingPitch(false);
                    }}
                    disabled={
                      !draftSubject.trim() ||
                      !draftBody.trim() ||
                      busy === `redesign-save-${activeRun.id}`
                    }
                    className={dangerButton}
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPitch(false)}
                    className={ghostButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-1.5 border-b border-white/10 px-4 py-3.5 font-mono text-[11px] text-white/60">
                  <div className="flex gap-3">
                    <span className="w-10 shrink-0 text-white/40">To</span>
                    <span className={activeRun.contact_email ? "" : "text-amber-300"}>
                      {activeRun.contact_email ?? "No address found — add one to send"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-10 shrink-0 text-white/40">Subj</span>
                    <span>{activeRun.pitch_subject ?? "—"}</span>
                  </div>
                </div>
                <div className="px-4 py-4 text-sm leading-[1.7] text-white/90">
                  {(activeRun.pitch_body ?? "").split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3">
                  {TONES.map((tone) => (
                    <button
                      key={tone.key}
                      type="button"
                      onClick={() => void onRegeneratePitch(activeRun.id, tone.key)}
                      disabled={sent || busy === `redesign-pitch-${activeRun.id}`}
                      className="border border-white/15 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
                    >
                      {tone.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => beginEdit(activeRun)}
                    disabled={sent}
                    className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-[#dfba73] transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>

          {activeRun.pitch_rationale && (
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/45">
              {activeRun.pitch_rationale}
            </p>
          )}

          <div className="mt-4 border border-white/10 p-4">
            <div className={label}>Attached</div>
            <div className="mt-2.5 grid gap-2 font-mono text-xs text-white/85">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">Live redesign link</span>
                <button
                  type="button"
                  onClick={() => void copyShareUrl()}
                  className="inline-flex shrink-0 items-center gap-1.5 text-[#dfba73] transition-opacity hover:opacity-80"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">Before/after comparison</span>
                <button
                  type="button"
                  onClick={() => setPreviewTab("side_by_side")}
                  className="shrink-0 text-[#dfba73] transition-opacity hover:opacity-80"
                >
                  View
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">Audit notes (PDF)</span>
                <button
                  type="button"
                  onClick={() => void onExportPdf(activeRun.id)}
                  disabled={busy === `redesign-pdf-${activeRun.id}`}
                  className="shrink-0 text-[#dfba73] transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">Hosted page</span>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[#dfba73] transition-opacity hover:opacity-80"
                >
                  Open <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {activeRun.lead_id && (
            <div className="mt-4 flex items-start gap-2.5 border border-white/10 p-3.5">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              <span className="text-xs leading-relaxed text-white/85">
                Saved to Lead Pipeline as{" "}
                <span className="text-[#dfba73]">{activeRun.business_name ?? activeRun.host}</span>{" "}
                — stage{" "}
                <span className="text-[#dfba73]">{sent ? "Pitch sent" : "Pitch drafted"}</span>.
              </span>
            </div>
          )}

          {sent && (
            <p className="mt-3 font-mono text-[11px] text-emerald-400">
              Sent {date(activeRun.sent_at)}.
            </p>
          )}
          {activeRun.error && (
            <p className="mt-3 font-mono text-[11px] text-amber-300">{activeRun.error}</p>
          )}

          <div className="mt-4 grid gap-2.5">
            <button
              type="button"
              onClick={() => void onSend(activeRun.id)}
              disabled={
                sent || !activeRun.contact_email || busy === `redesign-send-${activeRun.id}`
              }
              className="inline-flex items-center justify-center gap-2 bg-[#FF3333] px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {sent
                ? "Pitch sent"
                : busy === `redesign-send-${activeRun.id}`
                  ? "Sending…"
                  : "Send pitch"}
              {!sent && <Send className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={onOpenLeadPipeline}
              className="inline-flex items-center justify-center gap-2 border border-white/20 px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white/40"
            >
              Open in Lead Pipeline
            </button>
            <button
              type="button"
              onClick={async () => {
                await onArchive(activeRun.id);
                setActiveRunId(null);
              }}
              disabled={busy === `redesign-archive-${activeRun.id}`}
              className="inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white/70 disabled:opacity-40"
            >
              <Wand2 className="size-3" /> Archive this run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
