/**
 * The action queue behind the studio hub's Signal view.
 *
 * A signal is one thing that needs Rory's decision, derived from data the hub
 * already loads — pending balances, unread inbound, unsigned proposals, open
 * call-backs. Nothing here fetches; `buildSignals` is pure so the ranking rules
 * can be tested directly.
 */

import type { AdminInquiry, AdminOrder } from "@/utils/admin.functions";
import type { CrmLead } from "@/utils/crm.functions";
import type { ProjectProposal } from "@/utils/proposals.functions";

export const SIGNAL_CATEGORIES = ["MONEY", "CLIENTS", "LEADS"] as const;
export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];

/** Where a signal's primary action sends you. */
export type SignalTarget = { kind: "invoice"; orderId: string } | { kind: "view"; view: string };

export interface Signal {
  /** Stable across refetches so snoozing survives a poll. */
  id: string;
  category: SignalCategory;
  /** Age of the underlying record, e.g. "DUE TODAY" or "2 DAYS". */
  age: string;
  /** Right-aligned figure — a dollar amount or a count. */
  amount: string;
  /** True when the amount should read red and the card should glow. */
  urgent: boolean;
  title: string;
  body: string;
  action: string;
  target: SignalTarget;
  /** Lower sorts first. */
  weight: number;
}

const DAY_MS = 86_400_000;

/** Whole days between `iso` and `now`, clamped at zero. */
export function daysSince(iso: string | null | undefined, now: number = Date.now()): number {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now - then) / DAY_MS));
}

/**
 * Sentence-shaped age, for prose rather than the mono stamp. `relativeAge`
 * returns labels like THIS WEEK that read wrong followed by "ago".
 */
export function daysAgoPhrase(iso: string | null | undefined, now: number = Date.now()): string {
  const days = daysSince(iso, now);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** Mono age stamp in the queue's voice. */
export function relativeAge(iso: string | null | undefined, now: number = Date.now()): string {
  const days = daysSince(iso, now);
  if (days === 0) return "TODAY";
  if (days === 1) return "1 DAY";
  if (days < 7) return `${days} DAYS`;
  if (days < 14) return "THIS WEEK";
  if (days < 60) return `${Math.floor(days / 7)} WEEKS`;
  return `${Math.floor(days / 30)} MONTHS`;
}

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

const clientName = (order: AdminOrder) =>
  order.customer_name || order.customer_email || "This client";

export interface BuildSignalsInput {
  orders: AdminOrder[];
  inquiries: AdminInquiry[];
  leads: CrmLead[];
  proposals: ProjectProposal[];
  /** Injected in tests so age strings are deterministic. */
  now?: number;
}

/**
 * Turn the hub's loaded data into a ranked action queue.
 *
 * Ranking is by `weight`: money that can be collected today outranks unsigned
 * paper, which outranks unread inbound, which outranks call-backs.
 */
export function buildSignals({
  orders,
  inquiries,
  leads,
  proposals,
  now = Date.now(),
}: BuildSignalsInput): Signal[] {
  const signals: Signal[] = [];

  // 1. Money already earned but not yet invoiced — one card per commission.
  for (const order of orders) {
    if (!order.is_deposit) continue;
    if (order.balance_status !== "pending") continue;
    if (order.balance_due_cents <= 0) continue;

    signals.push({
      id: `balance:${order.id}`,
      category: "MONEY",
      age: relativeAge(order.created_at, now),
      amount: usd(order.balance_due_cents),
      urgent: true,
      title: `${clientName(order)} balance is invoiceable`,
      body: `${order.product_name || "This commission"} took a ${usd(
        order.amount_total,
      )} deposit on ${new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}. One click sends the balance invoice and the receipt.`,
      action: "SEND BALANCE INVOICE",
      target: { kind: "invoice", orderId: order.id },
      weight: 0,
    });
  }

  // 2. Paper that is out but unsigned — the deal stalls until it comes back.
  const unsigned = proposals.filter((p) => p.status === "sent");
  if (unsigned.length > 0) {
    const total = unsigned.reduce((sum, p) => sum + p.total_price_cents, 0);
    const oldest = unsigned.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b,
    );
    signals.push({
      id: "proposals:unsigned",
      category: "MONEY",
      age: relativeAge(oldest.created_at, now),
      amount: usd(total),
      urgent: daysSince(oldest.created_at, now) >= 7,
      title:
        unsigned.length === 1
          ? `${unsigned[0]!.client_name} hasn't signed yet`
          : `${unsigned.length} proposals are awaiting signature`,
      body: `${usd(total)} of scope is sitting unsigned. The oldest went out ${daysAgoPhrase(
        oldest.created_at,
        now,
      )} — a nudge is usually all it takes.`,
      action: "OPEN PROPOSALS",
      target: { kind: "view", view: "PROPOSALS" },
      weight: 1,
    });
  }

  // 3. Inbound that hasn't been answered — the audit promise is one business day.
  const unread = inquiries.filter((i) => i.status === "unread");
  if (unread.length > 0) {
    const oldest = unread.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b,
    );
    signals.push({
      id: "inquiries:unread",
      category: "LEADS",
      age: relativeAge(oldest.created_at, now),
      amount: String(unread.length),
      urgent: daysSince(oldest.created_at, now) >= 1,
      title:
        unread.length === 1 ? "One inbound lead unread" : `${unread.length} inbound leads unread`,
      body: "None of these have had a reply yet, and the free-audit promise is one business day.",
      action: "OPEN THE INBOX",
      target: { kind: "view", view: "INQUIRIES" },
      weight: 2,
    });
  }

  // 4. New leads in the CRM nobody has qualified.
  const newLeads = leads.filter((l) => l.stage === "new");
  if (newLeads.length > 0) {
    const oldest = newLeads.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b,
    );
    signals.push({
      id: "pipeline:new",
      category: "LEADS",
      age: relativeAge(oldest.created_at, now),
      amount: String(newLeads.length),
      urgent: false,
      title:
        newLeads.length === 1
          ? `${newLeads[0]!.full_name} hasn't been qualified`
          : `${newLeads.length} leads haven't been qualified`,
      body: "Still sitting at the top of the pipeline with no first contact logged.",
      action: "OPEN THE PIPELINE",
      target: { kind: "view", view: "PIPELINE" },
      weight: 3,
    });
  }

  // 5. Call-backs you promised someone — one card per open follow-up.
  for (const lead of leads) {
    for (const followup of lead.followups) {
      if (followup.status !== "open") continue;
      signals.push({
        id: `followup:${followup.id}`,
        category: "CLIENTS",
        age: relativeAge(followup.created_at, now),
        amount: followup.urgency.toUpperCase(),
        urgent: followup.urgency.toLowerCase() === "high",
        title: `${lead.full_name} is waiting on a call back`,
        body: `${followup.reason} — ${followup.summary}`,
        action: "OPEN THE PIPELINE",
        target: { kind: "view", view: "PIPELINE" },
        weight: 4,
      });
    }
  }

  return signals.sort((a, b) => a.weight - b.weight || a.title.localeCompare(b.title));
}
