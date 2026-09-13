import { useMemo, useState } from "react";
import type { AdminInquiry, AdminOrder } from "@/utils/admin.functions";
import type { CrmLead } from "@/utils/crm.functions";
import type { ProjectProposal } from "@/utils/proposals.functions";
import type { OnboardingRun } from "@/utils/onboarding.functions";
import type { FollowupDraft } from "@/utils/automation.functions";

export type SignalLane = "MONEY" | "LEADS" | "DELIVERY";

export interface SignalTarget {
  view: string;
}

interface SignalItem {
  id: string;
  lane: SignalLane;
  tag: string;
  age: string;
  amount: string | null;
  accent: "red" | "gold" | "white";
  title: string;
  body: string;
  action: string;
  target: string;
}

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);

const ageLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const ms = Date.now() - new Date(value).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "JUST NOW";
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
};

const daysSince = (value: string | null | undefined) =>
  value ? (Date.now() - new Date(value).getTime()) / 86_400_000 : 0;

const accentText = {
  red: "text-[#FF3333]",
  gold: "text-[#DFBA73]",
  white: "text-white",
} as const;

const accentBorder = {
  red: "border-[#FF3333]/40",
  gold: "border-[#DFBA73]/40",
  white: "border-white/10",
} as const;

export interface AdminSignalViewProps {
  orders: AdminOrder[];
  inquiries: AdminInquiry[];
  leads: CrmLead[];
  proposals: ProjectProposal[];
  onboardingRuns: OnboardingRun[];
  drafts: FollowupDraft[];
  unreadChats: number;
  onNavigate: (view: string) => void;
  onRunAutopilot: () => void;
  autopilotBusy: boolean;
}

export function AdminSignalView({
  orders,
  inquiries,
  leads,
  proposals,
  onboardingRuns,
  drafts,
  unreadChats,
  onNavigate,
  onRunAutopilot,
  autopilotBusy,
}: AdminSignalViewProps) {
  const [lane, setLane] = useState<SignalLane | "ALL">("ALL");
  const [snoozed, setSnoozed] = useState<string[]>([]);

  const pendingDrafts = useMemo(() => drafts.filter((d) => d.status === "draft"), [drafts]);
  const unreadInquiries = useMemo(
    () => inquiries.filter((i) => i.status === "unread"),
    [inquiries],
  );

  const signals = useMemo<SignalItem[]>(() => {
    const list: SignalItem[] = [];

    for (const run of onboardingRuns) {
      if (run.status !== "ready" && run.status !== "failed") continue;
      list.push({
        id: `setup-${run.id}`,
        lane: "DELIVERY",
        tag: run.status === "failed" ? "SETUP FAILED" : "NEW PURCHASE",
        age: ageLabel(run.created_at),
        amount: money(run.amount_cents, run.currency),
        accent: run.status === "failed" ? "red" : "gold",
        title: run.client_name || run.client_email,
        body:
          run.status === "failed"
            ? `Automatic setup failed for ${run.product_name ?? "this purchase"}. Re-run it or set the project up by hand.`
            : `${run.product_name ?? "New purchase"} — kickoff plan drafted and waiting for your approval.`,
        action: run.status === "failed" ? "FIX SETUP" : "APPROVE SETUP",
        target: "SETUP",
      });
    }

    for (const order of orders) {
      if (order.balance_due_cents > 0 && order.balance_status !== "paid") {
        list.push({
          id: `balance-${order.id}`,
          lane: "MONEY",
          tag: "BALANCE DUE",
          age: ageLabel(order.created_at),
          amount: money(order.balance_due_cents, order.currency),
          accent: "white",
          title: order.customer_name || order.customer_email || "Commission",
          body: `${order.product_name ?? "Commission"} — remaining balance is still open. Send the invoice when the work is ready.`,
          action: "OPEN COMMISSION",
          target: "PROJECTS",
        });
      }
    }

    for (const proposal of proposals) {
      if (proposal.status !== "sent" && proposal.status !== "viewed") continue;
      if (daysSince(proposal.created_at) < 3) continue;
      list.push({
        id: `proposal-${proposal.id}`,
        lane: "MONEY",
        tag: "UNSIGNED PROPOSAL",
        age: ageLabel(proposal.created_at),
        amount: money(proposal.total_price_cents, "USD"),
        accent: "gold",
        title: `${proposal.client_name} — ${proposal.project_title}`,
        body: `Sent ${Math.round(daysSince(proposal.created_at))} days ago and still unsigned. Time for a nudge.`,
        action: "OPEN PROPOSAL",
        target: "PROPOSALS",
      });
    }

    if (unreadInquiries.length > 0) {
      const first = unreadInquiries[0]!;
      list.push({
        id: "inquiries",
        lane: "LEADS",
        tag: "UNREAD LEADS",
        age: ageLabel(first.created_at),
        amount: String(unreadInquiries.length),
        accent: "red",
        title: `${unreadInquiries.length} new enquir${unreadInquiries.length === 1 ? "y" : "ies"}`,
        body: `Latest from ${first.name}${first.company ? ` · ${first.company}` : ""}. Reply while it's warm.`,
        action: "OPEN LEADS",
        target: "INQUIRIES",
      });
    }

    if (unreadChats > 0) {
      list.push({
        id: "chats",
        lane: "LEADS",
        tag: "WEBSITE CHAT",
        age: "LIVE",
        amount: String(unreadChats),
        accent: "red",
        title: `${unreadChats} unread chat${unreadChats === 1 ? "" : "s"}`,
        body: "Someone messaged through the site widget and hasn't had a reply yet.",
        action: "OPEN CHAT",
        target: "CHATS",
      });
    }

    const upcoming = leads.filter((lead) =>
      lead.bookings.some(
        (b) => b.status !== "cancelled" && new Date(b.slot_start).getTime() > Date.now(),
      ),
    );
    if (upcoming.length > 0) {
      const next = upcoming[0]!;
      list.push({
        id: "bookings",
        lane: "LEADS",
        tag: "CALLS BOOKED",
        age: ageLabel(next.updated_at),
        amount: String(upcoming.length),
        accent: "gold",
        title: `${upcoming.length} discovery call${upcoming.length === 1 ? "" : "s"} coming up`,
        body: `Next up: ${next.full_name}${next.company_name ? ` · ${next.company_name}` : ""}. Review the notes before the call.`,
        action: "OPEN PIPELINE",
        target: "PIPELINE",
      });
    }

    if (pendingDrafts.length > 0) {
      list.push({
        id: "drafts",
        lane: "LEADS",
        tag: "DRAFTS WAITING",
        age: ageLabel(pendingDrafts[0]!.created_at),
        amount: String(pendingDrafts.length),
        accent: "gold",
        title: `${pendingDrafts.length} follow-up draft${pendingDrafts.length === 1 ? "" : "s"} ready`,
        body: "Written for you overnight. Read, tweak if needed, approve to send.",
        action: "REVIEW DRAFTS",
        target: "AUTOPILOT",
      });
    }

    return list;
  }, [onboardingRuns, orders, proposals, unreadInquiries, unreadChats, leads, pendingDrafts]);

  const visible = signals.filter(
    (s) => !snoozed.includes(s.id) && (lane === "ALL" || s.lane === lane),
  );

  const collectedThisMonth = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      const now = new Date();
      return (
        o.payment_status === "paid" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, o) => sum + o.amount_total - (o.amount_refunded ?? 0), 0);

  const pendingBalance = orders
    .filter((o) => o.balance_status !== "paid")
    .reduce((sum, o) => sum + (o.balance_due_cents ?? 0), 0);

  const newLeads7d = leads.filter((l) => daysSince(l.created_at) <= 7).length;

  const kpis = [
    { label: "Collected this month", value: money(collectedThisMonth), sub: "Paid orders, net of refunds" },
    { label: "Open balances", value: money(pendingBalance), sub: "Invoice when work is approved" },
    { label: "New leads · 7 days", value: String(newLeads7d), sub: "Across all sources" },
    { label: "Needs you now", value: String(visible.length), sub: "Items in this queue" },
  ];

  const chips: (SignalLane | "ALL")[] = ["ALL", "MONEY", "LEADS", "DELIVERY"];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.22em] text-white/45">ACTION QUEUE</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setLane(chip)}
                className={`min-h-11 px-4 py-2 font-mono text-[11px] tracking-[0.2em] transition-colors ${
                  lane === chip
                    ? "bg-white text-black"
                    : "border border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {visible.map((signal) => (
          <article
            key={signal.id}
            className={`border bg-white/[0.02] p-6 ${accentBorder[signal.accent]}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`font-mono text-[10px] tracking-[0.2em] ${accentText[signal.accent]}`}
              >
                {signal.tag}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                {signal.age}
              </span>
              {signal.amount && (
                <span className={`ml-auto font-display text-2xl ${accentText[signal.accent]}`}>
                  {signal.amount}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-2xl uppercase leading-tight text-white">
              {signal.title}
            </h3>
            <p className="mt-2 max-w-2xl font-mono text-[15px] leading-[1.6] text-white/75">
              {signal.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate(signal.target)}
                className="min-h-11 bg-[#FF3333] px-5 py-3 font-mono text-[11px] font-bold tracking-[0.2em] text-black hover:bg-[#FF5555]"
              >
                {signal.action}
              </button>
              <button
                type="button"
                onClick={() => setSnoozed((prev) => [...prev, signal.id])}
                className="min-h-11 border border-white/18 px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-white/70 hover:border-white hover:text-white"
              >
                SNOOZE
              </button>
            </div>
          </article>
        ))}

        {visible.length === 0 && (
          <div className="border border-dashed border-white/15 px-6 py-14 text-center">
            <p className="font-display text-2xl uppercase text-white/70">Queue clear</p>
            <p className="mt-2 font-mono text-[13px] text-white/45">
              Nothing needs you in this filter.
            </p>
          </div>
        )}
      </div>

      <aside className="flex min-w-0 flex-col gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                {kpi.label}
              </span>
              <span className="font-display text-2xl text-white">{kpi.value}</span>
            </div>
            <span className="mt-2 block font-mono text-[11px] text-white/40">{kpi.sub}</span>
          </div>
        ))}

        <div className="border border-[#DFBA73]/30 bg-[#DFBA73]/[0.06] p-5">
          <span className="font-mono text-[10px] tracking-[0.22em] text-[#F6DC9A]">AUTOPILOT</span>
          <p className="mt-2 font-mono text-[13px] leading-[1.7] text-white/70">
            {pendingDrafts.length > 0
              ? `${pendingDrafts.length} follow-up draft${pendingDrafts.length === 1 ? "" : "s"} waiting. Approve in one pass.`
              : "No drafts waiting. Run a scan to look for quiet leads."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onNavigate("AUTOPILOT")}
              className="min-h-11 w-full bg-[#DFBA73] px-4 py-3 font-mono text-[11px] font-bold tracking-[0.2em] text-black hover:bg-[#F6DC9A]"
            >
              {pendingDrafts.length > 0 ? `REVIEW ${pendingDrafts.length} DRAFTS` : "OPEN AUTOPILOT"}
            </button>
            <button
              type="button"
              onClick={onRunAutopilot}
              disabled={autopilotBusy}
              className="min-h-11 w-full border border-white/18 px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-white/70 hover:border-white hover:text-white disabled:opacity-50"
            >
              {autopilotBusy ? "SCANNING…" : "RUN SCAN NOW"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
