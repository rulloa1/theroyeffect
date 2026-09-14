import { useMemo, useState } from "react";
import { SIGNAL_CATEGORIES, type Signal, type SignalCategory } from "@/lib/signals";
import {
  btnGhost,
  btnPrimary,
  btnGold,
  chip,
  emptyState,
  label,
  panel,
  panelGold,
  panelUrgent,
} from "@/components/signal/signal-ui";

type Filter = "ALL" | SignalCategory;

export interface SignalKpi {
  label: string;
  value: string;
  sub: string;
  /** Red draws the eye to the one number that is off. */
  alert?: boolean;
  /** 0–100 fill for the hairline bar under the number. */
  pct: number;
}

export interface AdminSignalViewProps {
  /** Already snooze-filtered by the route, so the header count agrees with the queue. */
  signals: Signal[];
  kpis: SignalKpi[];
  /** Follow-up drafts written overnight and waiting for a one-pass approval. */
  autopilotDrafts: number;
  busy: string | null;
  onAct: (signal: Signal) => void;
  onSnooze: (signalId: string) => void;
  onReviewDrafts: () => void;
}

export function AdminSignalView({
  signals,
  kpis,
  autopilotDrafts,
  busy,
  onAct,
  onSnooze,
  onReviewDrafts,
}: AdminSignalViewProps) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const visible = useMemo(
    () => signals.filter((s) => filter === "ALL" || s.category === filter),
    [signals, filter],
  );

  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={label}>ACTION QUEUE</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {(["ALL", ...SIGNAL_CATEGORIES] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={chip(filter === key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {visible.map((signal) => (
          <article key={signal.id} className={`p-[22px] ${signal.urgent ? panelUrgent : panel}`}>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={
                  signal.urgent
                    ? "bg-[#FF3333] px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.2em] text-black"
                    : "border border-white/20 px-2 py-[3px] font-mono text-[9px] tracking-[0.2em] text-white/60"
                }
              >
                {signal.category}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                {signal.age}
              </span>
              <span
                className={`ml-auto font-display text-2xl ${
                  signal.urgent ? "text-[#FF3333]" : "text-white"
                }`}
              >
                {signal.amount}
              </span>
            </div>

            <h3 className="mt-3 text-[clamp(1.25rem,2.4vw,1.625rem)] uppercase leading-[1.05] text-white">
              {signal.title}
            </h3>
            <p className="mt-2 max-w-[44rem] font-mono text-xs leading-[1.8] text-white/60">
              {signal.body}
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={busy === signal.id}
                onClick={() => onAct(signal)}
                className={signal.urgent ? btnPrimary : btnGold}
              >
                {busy === signal.id ? "WORKING…" : signal.action}
              </button>
              <button type="button" onClick={() => onSnooze(signal.id)} className={btnGhost}>
                SNOOZE
              </button>
            </div>
          </article>
        ))}

        {visible.length === 0 && (
          <div className={emptyState}>
            <p className="font-display text-[22px] uppercase text-white/70">Queue clear</p>
            <p className="mt-2 font-mono text-[11px] text-white/40">
              {signals.length === 0
                ? "Nothing needs you right now."
                : "Nothing needs you in this filter."}
            </p>
          </div>
        )}
      </div>

      <aside className="flex min-w-0 max-w-[360px] flex-col gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`p-4 ${panel}`}>
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                {kpi.label}
              </span>
              <span
                className={`font-display text-2xl ${kpi.alert ? "text-[#FF3333]" : "text-white"}`}
              >
                {kpi.value}
              </span>
            </div>
            <div className="mt-2.5 h-[3px] w-full bg-white/[0.08]">
              <div
                className={`h-full ${kpi.alert ? "bg-[#FF3333]" : "bg-[#DFBA73]"}`}
                style={{ width: `${Math.min(100, Math.max(0, kpi.pct))}%` }}
              />
            </div>
            <span className="mt-2 block font-mono text-[10px] text-white/35">{kpi.sub}</span>
          </div>
        ))}

        <div className={`p-4 ${panelGold}`}>
          <span className="font-mono text-[9px] tracking-[0.22em] text-[#F6DC9A]">AUTOPILOT</span>
          <p className="mt-2 font-mono text-[11px] leading-[1.8] text-white/65">
            {autopilotDrafts > 0
              ? `${autopilotDrafts} follow-up draft${
                  autopilotDrafts === 1 ? "" : "s"
                } written overnight. Approve in one pass.`
              : "No drafts waiting. Autopilot writes follow-ups as leads go quiet."}
          </p>
          <button
            type="button"
            onClick={onReviewDrafts}
            className="mt-3 w-full bg-[#DFBA73] py-[9px] font-mono text-[10px] font-bold tracking-[0.2em] text-black transition-opacity hover:opacity-90"
          >
            {autopilotDrafts > 0 ? `REVIEW ${autopilotDrafts} DRAFTS` : "OPEN AUTOPILOT"}
          </button>
        </div>
      </aside>
    </div>
  );
}
