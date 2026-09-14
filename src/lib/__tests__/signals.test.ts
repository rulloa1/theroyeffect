import { describe, expect, it } from "vitest";
import { buildSignals, daysSince, relativeAge } from "@/lib/signals";
import type { AdminInquiry, AdminOrder } from "@/utils/admin.functions";
import type { CrmLead } from "@/utils/crm.functions";
import type { ProjectProposal } from "@/utils/proposals.functions";

const NOW = new Date("2026-03-13T12:00:00Z").getTime();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

const order = (patch: Partial<AdminOrder> = {}): AdminOrder =>
  ({
    id: "order-1",
    stripe_session_id: "cs_1",
    customer_email: "dana@apexcontracting.com",
    customer_name: "Dana Whitfield",
    product_name: "Design + Build",
    amount_total: 400_000,
    currency: "usd",
    payment_status: "paid",
    purchase_kind: "commission",
    is_deposit: true,
    balance_due_cents: 400_000,
    balance_status: "pending",
    balance_invoice_url: null,
    amount_refunded: 0,
    created_at: daysAgo(38),
    ...patch,
  }) as AdminOrder;

const inquiry = (patch: Partial<AdminInquiry> = {}): AdminInquiry =>
  ({
    id: "inq-1",
    name: "Bayou Dental",
    email: "hi@bayoudental.com",
    project_type: "website",
    message: "Free audit please",
    status: "unread",
    created_at: daysAgo(2),
    ...patch,
  }) as AdminInquiry;

const lead = (patch: Partial<CrmLead> = {}): CrmLead =>
  ({
    id: "lead-1",
    full_name: "Mira Salon Co.",
    company_name: null,
    email: "mira@example.com",
    phone: null,
    website_url: null,
    project_type: "website",
    primary_goal: null,
    timeline: null,
    budget_range: null,
    notes: null,
    consent_to_follow_up: true,
    stage: "new",
    source: "free_audit",
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    bookings: [],
    audits: [],
    followups: [],
    ...patch,
  }) as CrmLead;

const proposal = (patch: Partial<ProjectProposal> = {}): ProjectProposal =>
  ({
    id: "prop-1",
    client_name: "Gulf Coast Dental",
    client_email: "ops@gulfcoast.com",
    project_title: "Design + Build",
    total_price_cents: 800_000,
    deposit_cents: 400_000,
    timeline_weeks: "4–6 weeks",
    status: "sent",
    created_at: daysAgo(4),
    share_token: "tok",
    ...patch,
  }) as ProjectProposal;

const empty = { orders: [], inquiries: [], leads: [], proposals: [], now: NOW };

describe("relativeAge", () => {
  it("names the near past in whole units", () => {
    expect(relativeAge(daysAgo(0), NOW)).toBe("TODAY");
    expect(relativeAge(daysAgo(1), NOW)).toBe("1 DAY");
    expect(relativeAge(daysAgo(3), NOW)).toBe("3 DAYS");
    expect(relativeAge(daysAgo(9), NOW)).toBe("THIS WEEK");
    expect(relativeAge(daysAgo(21), NOW)).toBe("3 WEEKS");
    expect(relativeAge(daysAgo(90), NOW)).toBe("3 MONTHS");
  });

  it("survives a missing or unparseable date", () => {
    expect(relativeAge(null, NOW)).toBe("TODAY");
    expect(daysSince("not-a-date", NOW)).toBe(0);
  });
});

describe("buildSignals", () => {
  it("returns nothing when there is nothing to decide", () => {
    expect(buildSignals(empty)).toEqual([]);
  });

  it("raises one urgent money signal per invoiceable balance", () => {
    const signals = buildSignals({ ...empty, orders: [order()] });

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: "balance:order-1",
      category: "MONEY",
      amount: "$4,000",
      urgent: true,
      action: "SEND BALANCE INVOICE",
      target: { kind: "invoice", orderId: "order-1" },
    });
    expect(signals[0]!.title).toBe("Dana Whitfield balance is invoiceable");
  });

  it("ignores balances that are settled, refunded away, or not deposits", () => {
    const signals = buildSignals({
      ...empty,
      orders: [
        order({ id: "a", balance_status: "paid" }),
        order({ id: "b", is_deposit: false }),
        order({ id: "c", balance_due_cents: 0 }),
      ],
    });

    expect(signals).toEqual([]);
  });

  it("sums unsigned proposals into one signal and escalates after a week", () => {
    const fresh = buildSignals({ ...empty, proposals: [proposal()] });
    expect(fresh[0]).toMatchObject({
      id: "proposals:unsigned",
      amount: "$8,000",
      urgent: false,
      action: "OPEN PROPOSALS",
    });
    expect(fresh[0]!.title).toBe("Gulf Coast Dental hasn't signed yet");

    const stale = buildSignals({
      ...empty,
      proposals: [proposal({ created_at: daysAgo(10) }), proposal({ id: "prop-2" })],
    });
    expect(stale[0]).toMatchObject({ amount: "$16,000", urgent: true });
    expect(stale[0]!.title).toBe("2 proposals are awaiting signature");
  });

  it("skips proposals that are still drafts or already signed", () => {
    const signals = buildSignals({
      ...empty,
      proposals: [proposal({ status: "draft" }), proposal({ id: "p2", status: "signed" })],
    });

    expect(signals).toEqual([]);
  });

  it("counts unread inbound and treats anything older than a day as urgent", () => {
    const signals = buildSignals({
      ...empty,
      inquiries: [inquiry(), inquiry({ id: "inq-2" }), inquiry({ id: "inq-3", status: "replied" })],
    });

    expect(signals[0]).toMatchObject({
      id: "inquiries:unread",
      category: "LEADS",
      amount: "2",
      urgent: true,
      target: { kind: "view", view: "INQUIRIES" },
    });
    expect(signals[0]!.title).toBe("2 inbound leads unread");
  });

  it("flags unqualified pipeline leads without marking them urgent", () => {
    const signals = buildSignals({
      ...empty,
      leads: [lead(), lead({ id: "lead-2", stage: "contacted" })],
    });

    expect(signals[0]).toMatchObject({
      id: "pipeline:new",
      amount: "1",
      urgent: false,
      target: { kind: "view", view: "PIPELINE" },
    });
    expect(signals[0]!.title).toBe("Mira Salon Co. hasn't been qualified");
  });

  it("raises a client signal per open follow-up only", () => {
    const signals = buildSignals({
      ...empty,
      leads: [
        lead({
          stage: "contacted",
          followups: [
            {
              id: "f1",
              reason: "Asked for pricing",
              urgency: "high",
              summary: "Wants the retainer number",
              status: "open",
              created_at: daysAgo(1),
            },
            {
              id: "f2",
              reason: "Done",
              urgency: "low",
              summary: "Closed out",
              status: "resolved",
              created_at: daysAgo(5),
            },
          ],
        }),
      ],
    });

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: "followup:f1",
      category: "CLIENTS",
      amount: "HIGH",
      urgent: true,
    });
    expect(signals[0]!.body).toBe("Asked for pricing — Wants the retainer number");
  });

  it("ranks money above paper above inbound above call-backs", () => {
    const signals = buildSignals({
      ...empty,
      orders: [order()],
      proposals: [proposal()],
      inquiries: [inquiry()],
      leads: [
        lead({
          followups: [
            {
              id: "f1",
              reason: "Call back",
              urgency: "low",
              summary: "Next week",
              status: "open",
              created_at: daysAgo(1),
            },
          ],
        }),
      ],
    });

    expect(signals.map((s) => s.id)).toEqual([
      "balance:order-1",
      "proposals:unsigned",
      "inquiries:unread",
      "pipeline:new",
      "followup:f1",
    ]);
  });
});
