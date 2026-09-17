import { useMemo } from "react";
import type { AdminOrder } from "@/utils/admin.functions";
import { label, panel } from "@/components/signal/signal-ui";

export interface AdminFinancialsViewProps {
  orders: AdminOrder[];
  money: (cents: number, currency: string) => string;
  date: (value: string | null) => string;
}

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** Compact money for the chart's column captions — $6.5k rather than $6,500.00. */
const compact = (cents: number) => {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  if (dollars === 0) return "—";
  return `$${Math.round(dollars)}`;
};

/**
 * Collected per calendar month for the trailing year, oldest first.
 *
 * Counts only money actually taken: unpaid orders are excluded, and refunds are
 * netted off the month the order landed in.
 *
 * Ceiling to be aware of: `adminListOrders` returns the 100 newest orders, so
 * past that volume the oldest months here understate — and because the bars are
 * scaled to the tallest month, that skews the shape as well as the totals. The
 * stat cards above share the same ceiling. Fixing it properly means aggregating
 * server-side rather than in the browser.
 */
function collectedByMonth(orders: AdminOrder[], now = new Date()) {
  const buckets: { key: string; label: string; cents: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()]!,
      cents: 0,
    });
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const order of orders) {
    // "Collected", not "invoiced" — an unpaid order is not revenue yet.
    if (order.payment_status !== "paid") continue;
    const d = new Date(order.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const at = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (at === undefined) continue;
    buckets[at]!.cents += order.amount_total - (order.amount_refunded || 0);
  }

  const peak = Math.max(1, ...buckets.map((b) => b.cents));
  return buckets.map((b) => ({ ...b, pct: Math.round((b.cents / peak) * 100) }));
}

export function AdminFinancialsView({ orders, money, date }: AdminFinancialsViewProps) {
  const months = useMemo(() => collectedByMonth(orders), [orders]);

  // Same definition of "collected" as the chart below, so the headline number and
  // the bars can never disagree: paid only, net of refunds.
  const paid = orders.filter((o) => o.payment_status === "paid");
  const totalRevenueCents = paid.reduce(
    (sum, o) => sum + (o.amount_total || 0) - (o.amount_refunded || 0),
    0,
  );
  const pendingBalanceCents = orders
    .filter((o) => o.balance_status === "pending")
    .reduce((sum, o) => sum + (o.balance_due_cents || 0), 0);
  const pendingCount = orders.filter(
    (o) => o.balance_status === "pending" && o.balance_due_cents > 0,
  ).length;
  // MRR is per subscription, not per payment: a retainer that has billed four
  // times is still one monthly figure. Keep the most recent charge per
  // subscription and sum those. "Active" here means it has billed inside the
  // window we can see — a cancelled subscription's last charge still counts
  // until it ages out, which is the best this endpoint's data supports.
  const latestPerSubscription = new Map<string, AdminOrder>();
  for (const o of paid) {
    const id = o.stripe_subscription_id;
    if (!id) continue;
    const seen = latestPerSubscription.get(id);
    if (!seen || new Date(o.created_at) > new Date(seen.created_at)) {
      latestPerSubscription.set(id, o);
    }
  }
  const retainerCount = latestPerSubscription.size;
  const retainerMrrCents = [...latestPerSubscription.values()].reduce(
    (sum, o) => sum + (o.amount_total || 0),
    0,
  );

  const commissions = paid.filter((o) => !o.stripe_subscription_id);
  const avgProjectCents = commissions.length
    ? Math.round(
        commissions.reduce((sum, o) => sum + (o.amount_total || 0), 0) / commissions.length,
      )
    : 0;

  const stats = [
    {
      label: "Collected",
      value: money(totalRevenueCents, "usd"),
      sub: `${paid.length} paid transaction${paid.length === 1 ? "" : "s"}`,
      tone: "text-white",
    },
    {
      label: "Outstanding",
      value: money(pendingBalanceCents, "usd"),
      sub: `${pendingCount} balance${pendingCount === 1 ? "" : "s"} pending`,
      tone: pendingBalanceCents > 0 ? "text-[#FF3333]" : "text-white",
    },
    {
      label: "Retainer MRR",
      value: money(retainerMrrCents, "usd"),
      sub: `${retainerCount} active retainer${retainerCount === 1 ? "" : "s"}`,
      tone: "text-[#DFBA73]",
    },
    {
      label: "Avg. project",
      value: money(avgProjectCents, "usd"),
      sub: `${commissions.length} commission${commissions.length === 1 ? "" : "s"}, retainers excluded`,
      tone: "text-white",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-[18px] ${panel}`}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
              {stat.label}
            </span>
            <p className={`mt-2 font-display text-[32px] leading-none ${stat.tone}`}>
              {stat.value}
            </p>
            <span className="mt-1.5 block font-mono text-[10px] text-white/35">{stat.sub}</span>
          </div>
        ))}
      </div>

      <div className={`p-5 ${panel}`}>
        <span className={label}>COLLECTED BY MONTH</span>
        <div className="mt-5 flex h-[180px] items-end gap-2.5">
          {months.map((m) => (
            <div
              key={m.key}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              title={`${m.label}: ${money(m.cents, "usd")}`}
            >
              <span className="font-mono text-[9px] text-white/45">{compact(m.cents)}</span>
              <div
                className="w-full"
                style={{
                  height: `${m.pct}%`,
                  background: "linear-gradient(to top, #FF3333, rgba(255,51,51,0.35))",
                }}
              />
              <span className="font-mono text-[9px] tracking-[0.1em] text-white/35">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-5 ${panel}`}>
        <span className={label}>TRANSACTION BREAKDOWN</span>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[9px] tracking-[0.2em] text-white/40">
                <th className="pb-3 font-normal">CLIENT</th>
                <th className="pb-3 font-normal">PRODUCT</th>
                <th className="pb-3 font-normal">TYPE</th>
                <th className="pb-3 text-right font-normal">PAID</th>
                <th className="pb-3 text-right font-normal">BALANCE</th>
                <th className="pb-3 text-right font-normal">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="text-white/80 transition-colors hover:bg-white/[0.02]">
                  <td className="py-3 text-white">
                    {o.customer_name || o.customer_email || "Client"}
                  </td>
                  <td className="py-3 text-white/60">{o.product_name || "Commission"}</td>
                  <td className="py-3">
                    {o.is_deposit ? (
                      <span className="text-[#FF3333]">Deposit</span>
                    ) : o.stripe_subscription_id ? (
                      <span className="text-[#DFBA73]">Retainer</span>
                    ) : (
                      "Full pay"
                    )}
                  </td>
                  <td className="py-3 text-right text-white">
                    {money(o.amount_total, o.currency)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={
                        o.balance_status === "paid"
                          ? "text-emerald-400"
                          : o.balance_status === "pending"
                            ? "text-amber-400"
                            : "text-white/40"
                      }
                    >
                      {o.is_deposit ? o.balance_status.toUpperCase() : "N/A"}
                    </span>
                  </td>
                  <td className="py-3 text-right text-white/50">{date(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
