import { useState } from "react";
import { AlertTriangle, CalendarClock, Globe, Mail, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { LEAD_STAGES, type CrmLead } from "@/utils/crm.functions";
import { LeadDetailDrawer } from "@/components/admin/LeadDetailDrawer";
import { relativeAge } from "@/lib/signals";
import {
  btnGhostSm,
  emptyState,
  input,
  label,
  panel,
  select,
} from "@/components/signal/signal-ui";

const STAGE_LABELS: Record<string, string> = {
  new: "NEW",
  contacted: "CONTACTED",
  discovery_scheduled: "CALL BOOKED",
  proposal_sent: "PROPOSAL OUT",
  won: "WON",
  lost: "LOST",
};

/** Red = untouched, gold = waiting on them, green = closed, dim = dead. */
const STAGE_COUNT_COLOR: Record<string, string> = {
  new: "text-[#FF3333]",
  contacted: "text-white",
  discovery_scheduled: "text-white",
  proposal_sent: "text-[#DFBA73]",
  won: "text-[#34d399]",
  lost: "text-white/40",
};

const STAGE_PILL: Record<string, string> = {
  new: "border-[#FF3333]/50 bg-[#FF3333]/10 text-[#FF3333]",
  contacted: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  discovery_scheduled: "border-white/20 bg-white/5 text-white/70",
  proposal_sent: "border-[#DFBA73]/40 bg-[#DFBA73]/10 text-[#DFBA73]",
  won: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  lost: "border-white/15 bg-white/5 text-white/40",
};

function nextAction(lead: CrmLead) {
  const openFollowup = lead.followups.find((f) => f.status === "open");
  if (openFollowup) return `Call back: ${openFollowup.reason}`;

  const upcoming = lead.bookings
    .filter((b) => b.status === "scheduled" && new Date(b.slot_start).getTime() > Date.now())
    .sort((a, b) => +new Date(a.slot_start) - +new Date(b.slot_start))[0];
  if (upcoming) return "Prepare for discovery call";

  const pastScheduled = lead.bookings.find(
    (b) => b.status === "scheduled" && new Date(b.slot_start).getTime() <= Date.now(),
  );
  if (pastScheduled) return "Mark call complete & send proposal";

  const pendingAudit = lead.audits.find((a) => a.status === "audit_in_progress");
  if (pendingAudit) return "Deliver the free audit";

  if (lead.stage === "proposal_sent") return "Chase proposal signature";
  if (lead.stage === "won") return "Kick off project brief";
  if (lead.stage === "lost") return "No action";
  if (lead.stage === "contacted") return "Book a discovery call";
  return "Reach out and qualify";
}

/** One-line card subtitle: where they came from, what they want, how stale. */
function leadMeta(lead: CrmLead) {
  return [
    lead.source.replace(/_/g, " "),
    lead.company_name || lead.project_type.replace(/_/g, " "),
    relativeAge(lead.created_at).toLowerCase(),
  ]
    .filter(Boolean)
    .join(" · ");
}

export interface AdminPipelineViewProps {
  leads: CrmLead[];
  onUpdateStage: (leadId: string, stage: string) => Promise<void>;
  onUpdateBooking: (bookingId: string, status: string) => Promise<void>;
  onResolveFollowup: (followupId: string, status: string) => Promise<void>;
  date: (value: string | null) => string;
}

export function AdminPipelineView({
  leads,
  onUpdateStage,
  onUpdateBooking,
  onResolveFollowup,
  date,
}: AdminPipelineViewProps) {
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [detailLead, setDetailLead] = useState<CrmLead | null>(null);

  const filtered = leads.filter((lead) => {
    if (stageFilter !== "ALL" && lead.stage !== stageFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      lead.full_name.toLowerCase().includes(q) ||
      (lead.email ?? "").toLowerCase().includes(q) ||
      (lead.company_name ?? "").toLowerCase().includes(q) ||
      (lead.phone ?? "").toLowerCase().includes(q)
    );
  });

  const run = async (key: string, fn: () => Promise<void>, message: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(message);
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(null);
    }
  };

  const slotTime = (iso: string, tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz || "America/Chicago",
    }).format(new Date(iso));

  return (
    <div className="flex flex-col gap-5">
      {/* Board — every stage at a glance; a column header filters the list below. */}
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
        {LEAD_STAGES.map((stage) => {
          const inStage = leads.filter((l) => l.stage === stage);
          const active = stageFilter === stage;

          return (
            <div
              key={stage}
              className={`min-w-0 ${
                active ? "border border-[#FF3333] bg-[#FF3333]/[0.06]" : panel
              }`}
            >
              <button
                type="button"
                onClick={() => setStageFilter(active ? "ALL" : stage)}
                aria-pressed={active}
                className="flex w-full items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/55">
                  {STAGE_LABELS[stage]}
                </span>
                <span
                  className={`font-display text-[18px] ${STAGE_COUNT_COLOR[stage] ?? "text-white"}`}
                >
                  {inStage.length}
                </span>
              </button>

              <div className="flex flex-col gap-2 px-4 py-3.5">
                {inStage.length === 0 && (
                  <p className="font-mono text-[10px] text-white/25">Empty</p>
                )}
                {inStage.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setDetailLead(lead)}
                    className="border border-white/[0.08] bg-white/[0.02] p-3 text-left transition-colors hover:border-[#FF3333]/40"
                  >
                    <p className="font-display text-[15px] uppercase text-white">
                      {lead.full_name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] leading-[1.7] text-white/45">
                      {leadMeta(lead)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail list — where the bookings and follow-ups get worked. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={label}>
          {stageFilter === "ALL"
            ? `ALL LEADS (${filtered.length})`
            : `${STAGE_LABELS[stageFilter]} (${filtered.length})`}
        </span>
        {stageFilter !== "ALL" && (
          <button type="button" onClick={() => setStageFilter("ALL")} className={btnGhostSm}>
            CLEAR FILTER
          </button>
        )}
        <div className="relative ml-auto w-[min(100%,260px)]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search leads"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${input} pl-[30px]`}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={emptyState}>
          <p className="font-display text-[22px] uppercase text-white/70">No leads here</p>
          <p className="mt-2 font-mono text-[11px] text-white/40">Nothing matches this view yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map((lead) => {
            const upcoming = lead.bookings.filter((b) => b.status === "scheduled");
            const openFollowups = lead.followups.filter((f) => f.status === "open");

            return (
              <article
                key={lead.id}
                className={`p-[22px] ${panel} transition-colors hover:border-white/20`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-[1_1_260px]">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-[22px] uppercase text-white">{lead.full_name}</h3>
                      <span
                        className={`border px-2 py-[3px] font-mono text-[9px] tracking-[0.2em] ${
                          STAGE_PILL[lead.stage] ?? STAGE_PILL["new"]
                        }`}
                      >
                        {STAGE_LABELS[lead.stage] ?? lead.stage.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                        {relativeAge(lead.created_at)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-white/45">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 hover:text-white"
                        >
                          <Mail className="size-3 text-[#FF3333]" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-white"
                        >
                          <Phone className="size-3 text-[#FF3333]" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.website_url && (
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="size-3 text-[#FF3333]" />
                          {lead.website_url}
                        </span>
                      )}
                      <span>{date(lead.created_at)}</span>
                    </div>

                    {lead.primary_goal && (
                      <p className="mt-2.5 max-w-[40rem] font-mono text-xs leading-[1.8] text-white/60">
                        {lead.primary_goal}
                      </p>
                    )}
                  </div>

                  <div className="flex-[0_0_200px]">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">
                      NEXT ACTION
                    </span>
                    <p className="mt-1 font-mono text-xs leading-[1.7] text-[#FF3333]">
                      {nextAction(lead)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDetailLead(lead)}
                      className={`mt-3 ${btnGhostSm}`}
                    >
                      VIEW DETAIL
                    </button>
                  </div>
                </div>

                {upcoming.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                    {upcoming.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.02] px-3 py-2"
                      >
                        <span className="inline-flex items-center gap-2 font-mono text-[11px] text-white/80">
                          <CalendarClock className="size-3.5 text-[#FF3333]" />
                          {slotTime(b.slot_start, b.time_zone)} ({b.time_zone})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy === b.id}
                            onClick={() =>
                              run(b.id, () => onUpdateBooking(b.id, "completed"), "Call marked complete")
                            }
                            className={btnGhostSm}
                          >
                            COMPLETED
                          </button>
                          <button
                            type="button"
                            disabled={busy === b.id}
                            onClick={() =>
                              run(b.id, () => onUpdateBooking(b.id, "no_show"), "Marked no-show")
                            }
                            className={btnGhostSm}
                          >
                            NO-SHOW
                          </button>
                          <button
                            type="button"
                            disabled={busy === b.id}
                            onClick={() =>
                              run(b.id, () => onUpdateBooking(b.id, "cancelled"), "Booking cancelled")
                            }
                            className={btnGhostSm}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {openFollowups.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {openFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="flex flex-wrap items-center justify-between gap-3 border border-amber-400/20 bg-amber-400/[0.04] px-3 py-2"
                      >
                        <span className="inline-flex items-start gap-2 font-mono text-[11px] leading-[1.7] text-white/80">
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
                          <span>
                            <strong className="font-normal text-amber-300">
                              {f.urgency.toUpperCase()}
                            </strong>{" "}
                            · {f.reason} — {f.summary}
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={busy === f.id}
                          onClick={() =>
                            run(f.id, () => onResolveFollowup(f.id, "resolved"), "Follow-up resolved")
                          }
                          className={btnGhostSm}
                        >
                          RESOLVE
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {lead.audits.length > 0 && (
                  <p className="mt-3 font-mono text-[11px] text-white/50">
                    Audit requests:{" "}
                    {lead.audits.map((a) => `${a.website_url} (${a.status})`).join(", ")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-white/[0.08] pt-4">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">STAGE</span>
                  <select
                    value={lead.stage}
                    disabled={busy === lead.id}
                    aria-label={`Stage for ${lead.full_name}`}
                    onChange={(e) =>
                      run(lead.id, () => onUpdateStage(lead.id, e.target.value), "Stage updated")
                    }
                    className={select}
                  >
                    {LEAD_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  {!LEAD_STAGES.includes(lead.stage as (typeof LEAD_STAGES)[number]) && (
                    <span className="font-mono text-[10px] text-white/40">
                      (current: {lead.stage})
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <LeadDetailDrawer lead={detailLead} onClose={() => setDetailLead(null)} />
    </div>
  );
}
