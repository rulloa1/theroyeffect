import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { AdminBrief, AdminOrder } from "@/utils/admin.functions";
import {
  btnGhostSm,
  btnPrimarySm,
  chip,
  emptyState,
  flagNeutral,
  flagUrgent,
  input,
  label,
  panel,
  select,
} from "@/components/signal/signal-ui";

export type FilterTab = "ALL" | "PENDING_BALANCE" | "PAID_IN_FULL" | "RETAINERS" | "REFUNDED";

export const MILESTONES = [
  { id: "brief_received", label: "1. Brief Received" },
  { id: "direction_locked", label: "2. Direction Locked" },
  { id: "design_build", label: "3. Design & Build" },
  { id: "in_review", label: "4. Review Rounds" },
  { id: "completed", label: "5. Completed & Live" },
];

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "ALL" },
  { id: "PENDING_BALANCE", label: "PENDING BALANCE" },
  { id: "PAID_IN_FULL", label: "PAID IN FULL" },
  { id: "RETAINERS", label: "RETAINERS" },
  { id: "REFUNDED", label: "REFUNDED" },
];

/** Milestone index → completion, so the hairline bar tracks real progress. */
const progressOf = (milestone: string) => {
  const index = MILESTONES.findIndex((m) => m.id === milestone);
  return index < 0 ? 20 : ((index + 1) / MILESTONES.length) * 100;
};

const milestoneCaption = (milestone: string) => {
  const index = MILESTONES.findIndex((m) => m.id === milestone);
  const step = index < 0 ? 1 : index + 1;
  const name = (MILESTONES[index] ?? MILESTONES[0]!).label.replace(/^\d+\.\s*/, "");
  return `${step} / ${MILESTONES.length} ${name.toUpperCase()}`;
};

export interface AdminProjectsViewProps {
  orders: AdminOrder[];
  filterTab: FilterTab;
  setFilterTab: (tab: FilterTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSendInvoice: (orderId: string) => Promise<void>;
  onUpdateMilestone: (orderId: string, milestone: string) => Promise<void>;
  onViewBrief: (brief: AdminBrief) => void;
  onCreateProposalFromBrief?: (brief: AdminBrief) => void;
  busy: string | null;
  money: (cents: number, currency: string) => string;
  date: (value: string | null) => string;
}

export function AdminProjectsView({
  orders,
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  onSendInvoice,
  onUpdateMilestone,
  onViewBrief,
  onCreateProposalFromBrief,
  busy,
  money,
  date,
}: AdminProjectsViewProps) {
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "PENDING_BALANCE" && o.balance_status !== "pending") return false;
    if (filterTab === "PAID_IN_FULL" && (o.balance_status !== "paid" || o.is_deposit === false))
      return false;
    if (filterTab === "RETAINERS" && !o.stripe_subscription_id) return false;
    if (filterTab === "REFUNDED" && o.amount_refunded <= 0) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.customer_name ?? "").toLowerCase().includes(q) ||
      (o.customer_email ?? "").toLowerCase().includes(q) ||
      (o.stripe_session_id ?? "").toLowerCase().includes(q) ||
      (o.product_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={label}>
          {filteredOrders.length} {filteredOrders.length === 1 ? "COMMISSION" : "COMMISSIONS"}
        </span>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              aria-pressed={filterTab === tab.id}
              className={chip(filterTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-[min(100%,260px)]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search clients, emails"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${input} pl-[30px]`}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={emptyState}>
          <p className="font-display text-[22px] uppercase text-white/70">Nothing here</p>
          <p className="mt-2 font-mono text-[11px] text-white/40">
            No commissions match this view.
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const isDepositPending = order.is_deposit && order.balance_status === "pending";
          const currentMilestone = order.brief?.project_status ?? "brief_received";
          const progress = progressOf(currentMilestone);
          const complete = currentMilestone === "completed";

          return (
            <article
              key={order.id}
              className={`p-[22px] ${
                isDepositPending
                  ? "border border-[#FF3333]/45 bg-[#FF3333]/[0.05]"
                  : `${panel} transition-colors hover:border-white/20`
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-[1_1_260px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[22px] uppercase text-white">
                      {order.customer_name || "Client"}
                    </h3>
                    {isDepositPending ? (
                      <span className={flagUrgent}>NEEDS YOU</span>
                    ) : order.stripe_subscription_id ? (
                      <span className={flagNeutral}>RETAINER</span>
                    ) : complete ? (
                      <span className={flagNeutral}>LIVE</span>
                    ) : null}
                  </div>

                  <p className="mt-1 font-mono text-[11px] text-white/45">
                    {order.customer_email} ·{" "}
                    {(order.product_name || "Custom commission").toUpperCase()}
                  </p>

                  <p className="mt-2.5 max-w-[40rem] font-mono text-xs leading-[1.8] text-white/60">
                    {order.brief?.goals ??
                      `Ordered ${date(order.created_at)}. No project brief attached yet.`}
                  </p>
                </div>

                <div className="flex-[0_0_200px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">
                      PAID
                    </span>
                    <span className="font-display text-[22px] text-white">
                      {money(order.amount_total, order.currency)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">
                      BALANCE
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        order.balance_status === "pending"
                          ? "text-amber-400"
                          : order.balance_status === "paid"
                            ? "text-emerald-400"
                            : "text-white/50"
                      }`}
                    >
                      {order.is_deposit
                        ? `${money(order.balance_due_cents, order.currency)} ${order.balance_status.toUpperCase()}`
                        : "PAID IN FULL"}
                    </span>
                  </div>

                  <div className="mt-3.5 h-[3px] w-full bg-white/10">
                    <div
                      className={`h-full ${complete ? "bg-emerald-400" : "bg-[#FF3333]"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[9px] tracking-[0.16em] text-white/50">
                    {milestoneCaption(currentMilestone)}
                  </p>
                </div>
              </div>

              <div className="mt-[18px] flex flex-wrap items-center gap-2.5 border-t border-white/[0.08] pt-4">
                <select
                  value={currentMilestone}
                  disabled={updatingMilestone === order.id}
                  aria-label={`Milestone for ${order.customer_name || "client"}`}
                  onChange={async (e) => {
                    setUpdatingMilestone(order.id);
                    try {
                      await onUpdateMilestone(order.id, e.target.value);
                      toast.success("Milestone updated");
                    } catch {
                      toast.error("Failed to update milestone");
                    } finally {
                      setUpdatingMilestone(null);
                    }
                  }}
                  className={select}
                >
                  {MILESTONES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {order.brief && (
                  <button
                    type="button"
                    onClick={() => onViewBrief(order.brief!)}
                    className={btnGhostSm}
                  >
                    VIEW BRIEF
                  </button>
                )}

                {onCreateProposalFromBrief && order.brief && (
                  <button
                    type="button"
                    onClick={() => onCreateProposalFromBrief(order.brief!)}
                    className={btnGhostSm}
                  >
                    NEW PROPOSAL
                  </button>
                )}

                {isDepositPending && (
                  <button
                    type="button"
                    disabled={busy === order.id}
                    onClick={() => onSendInvoice(order.id)}
                    className={`ml-auto ${btnPrimarySm}`}
                  >
                    {busy === order.id ? "SENDING…" : "SEND BALANCE INVOICE"}
                  </button>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
