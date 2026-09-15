/**
 * Exercises the Stripe webhook route through its POST handler. Lives under
 * src/lib/__tests__ rather than next to the route so TanStack Router's
 * file-based route generator never sees a test file inside src/routes.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, any>;
type Filter = [field: string, op: "eq" | "neq", value: unknown];

function createFakeDb(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((r) => ({ ...r }));
  const calls: {
    table: string;
    op: string;
    payload?: Row | undefined;
    filters: Filter[];
    options?: Row | undefined;
  }[] = [];
  const failures: { table: string; op: string; message: string }[] = [];

  function from(table: string) {
    const rows = (tables[table] ??= []);
    let op = "select";
    let payload: Row | undefined;
    let options: Row | undefined;
    const filters: Filter[] = [];
    const matches = (r: Row) =>
      filters.every(([k, f, v]) => (f === "eq" ? r[k] === v : r[k] !== v));

    const runQuery = () => {
      calls.push({ table, op, payload, filters: [...filters], options });
      const failure = failures.find((f) => f.table === table && f.op === op);
      if (failure) return { data: null, error: { message: failure.message } };
      if (op === "upsert") {
        const key = options?.["onConflict"] as string;
        const existing = rows.find((r) => r[key] === payload![key]);
        if (existing) Object.assign(existing, payload);
        else rows.push({ id: `${table}-${rows.length + 1}`, ...payload });
        return { data: null, error: null };
      }
      if (op === "update") {
        const hit = rows.filter(matches);
        hit.forEach((r) => Object.assign(r, payload));
        return { data: hit, error: null };
      }
      return { data: rows.filter(matches), error: null };
    };

    const builder: any = {
      select: () => builder,
      update: (p: Row) => ((op = "update"), (payload = p), builder),
      upsert: (p: Row, o: Row) => ((op = "upsert"), (payload = p), (options = o), builder),
      eq: (k: string, v: unknown) => (filters.push([k, "eq", v]), builder),
      neq: (k: string, v: unknown) => (filters.push([k, "neq", v]), builder),
      maybeSingle: async () => {
        const res = runQuery();
        return { data: (res.data as Row[] | null)?.[0] ?? null, error: res.error };
      },
      then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve().then(runQuery).then(res, rej),
    };
    return builder;
  }

  return { from, tables, calls, failures };
}

const SECRETS = { live: "whsec_fake_live", sandbox: "whsec_fake_sandbox" } as const;

const mocks = vi.hoisted(() => ({
  db: null as any,
  sendTemplateEmail: vi.fn(),
  startOnboarding: vi.fn(),
  fulfillPaidDiscoveryBooking: vi.fn(),
  settleCommissionBalance: vi.fn(),
  resolvePaymentsEnv: vi.fn(),
  sessionsRetrieve: vi.fn(),
  constructEventAsync: vi.fn(),
  createStripeClient: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("stripe", () => ({ default: { createSubtleCryptoProvider: () => ({}) } }));
vi.mock("@/lib/stripe.server", () => ({
  createStripeClient: (env: string) => mocks.createStripeClient(env),
  resolvePaymentsEnv: () => mocks.resolvePaymentsEnv(),
}));
vi.mock("@/lib/email-templates/send-email", () => ({
  sendTemplateEmail: (...args: unknown[]) => mocks.sendTemplateEmail(...args),
}));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: (t: string) => mocks.db.from(t) },
}));
vi.mock("@/lib/automation/onboarding.server", () => ({
  startOnboarding: (...args: unknown[]) => mocks.startOnboarding(...args),
}));
vi.mock("@/lib/booking/discovery-payment.server", () => ({
  fulfillPaidDiscoveryBooking: (...args: unknown[]) => mocks.fulfillPaidDiscoveryBooking(...args),
}));
vi.mock("@/lib/booking/balance-payment.server", () => ({
  settleCommissionBalance: (...args: unknown[]) => mocks.settleCommissionBalance(...args),
}));

const { Route } = await import("@/routes/api/public/payments/webhook");
const POST = (Route as any).options.server.handlers.POST as (ctx: {
  request: Request;
}) => Promise<Response>;

/** The fake Stripe accepts a signature equal to "valid:" plus that environment's secret. */
const sign = (env: keyof typeof SECRETS) => `valid:${SECRETS[env]}`;

function post(event: unknown, signature: string | null = sign("sandbox")) {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature !== null) headers.set("stripe-signature", signature);
  return POST({
    request: new Request("https://example.test/api/public/payments/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify(event),
    }),
  });
}

function checkoutSession(overrides: Row = {}): Row {
  return {
    id: "cs_test_order",
    object: "checkout.session",
    mode: "payment",
    livemode: false,
    payment_status: "paid",
    status: "complete",
    amount_total: 250000,
    currency: "usd",
    payment_intent: "pi_test_order",
    customer: "cus_1",
    subscription: null,
    customer_email: null,
    customer_details: { email: "Buyer@Example.com", name: "Bea Buyer" },
    metadata: { tier_label: "Signature" },
    ...overrides,
  };
}

function event(type: string, object: Row, livemode = false) {
  return { id: `evt_${type}`, type, livemode, data: { object } };
}

const orderUpserts = () =>
  mocks.db.calls.filter((c: Row) => c["table"] === "orders" && c["op"] === "upsert");

beforeEach(() => {
  mocks.db = createFakeDb();
  vi.stubEnv("PAYMENTS_LIVE_WEBHOOK_SECRET", SECRETS.live);
  vi.stubEnv("PAYMENTS_SANDBOX_WEBHOOK_SECRET", SECRETS.sandbox);
  mocks.sendTemplateEmail.mockReset().mockResolvedValue({ ok: true });
  mocks.startOnboarding.mockReset().mockResolvedValue(undefined);
  mocks.fulfillPaidDiscoveryBooking.mockReset();
  mocks.settleCommissionBalance.mockReset().mockResolvedValue({ settled: true });
  mocks.resolvePaymentsEnv.mockReset().mockReturnValue("sandbox");
  mocks.constructEventAsync
    .mockReset()
    .mockImplementation(async (body: string, signature: string, secret: string) => {
      if (signature !== `valid:${secret}`) throw new Error("No signatures found matching");
      return JSON.parse(body);
    });
  mocks.sessionsRetrieve
    .mockReset()
    .mockImplementation(async (id: string) => ({
      ...checkoutSession({ id }),
      line_items: { data: [] },
    }));
  mocks.createStripeClient.mockReset().mockImplementation(() => ({
    webhooks: { constructEventAsync: mocks.constructEventAsync },
    checkout: { sessions: { retrieve: mocks.sessionsRetrieve } },
    charges: { retrieve: vi.fn() },
  }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  return () => vi.unstubAllEnvs();
});

describe("webhook signature verification", () => {
  it("returns 401 when the stripe-signature header is missing", async () => {
    const res = await post(event("checkout.session.completed", checkoutSession()), null);
    expect(res.status).toBe(401);
    expect(mocks.constructEventAsync).not.toHaveBeenCalled();
  });

  it("returns 401 for a signature that matches no configured environment", async () => {
    const res = await post(event("checkout.session.completed", checkoutSession()), "t=1,v1=forged");
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Invalid signature");
    expect(mocks.constructEventAsync).toHaveBeenCalledTimes(2);
    expect(mocks.db.calls).toHaveLength(0);
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when no webhook secrets are configured", async () => {
    vi.stubEnv("PAYMENTS_LIVE_WEBHOOK_SECRET", "");
    vi.stubEnv("PAYMENTS_SANDBOX_WEBHOOK_SECRET", "");
    const res = await post(event("checkout.session.completed", checkoutSession()));
    expect(res.status).toBe(401);
    expect(mocks.constructEventAsync).not.toHaveBeenCalled();
  });

  it("returns 400 when a sandbox-signed event claims to be livemode", async () => {
    const res = await post(event("charge.refunded", { payment_intent: "pi_1" }, true));
    expect(res.status).toBe(400);
    expect(mocks.db.calls).toHaveLength(0);
  });

  it("accepts a live-signed live event", async () => {
    const res = await post(event("some.unhandled.event", {}, true), sign("live"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
  });
});

describe("checkout.session.completed", () => {
  it("creates one order, sends receipts once, and marks emails sent", async () => {
    const res = await post(event("checkout.session.completed", checkoutSession()));

    expect(res.status).toBe(200);
    expect(orderUpserts()).toHaveLength(1);
    expect(orderUpserts()[0].options).toEqual({ onConflict: "stripe_session_id" });
    const orders = mocks.db.tables["orders"];
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      stripe_session_id: "cs_test_order",
      stripe_payment_intent_id: "pi_test_order",
      amount_total: 250000,
      environment: "sandbox",
      purchase_kind: "one_time",
      emails_sent: true,
    });
    const templates = mocks.sendTemplateEmail.mock.calls.map(([t]) => t);
    expect(templates).toEqual(["order-notification", "order-confirmation"]);
    expect(mocks.startOnboarding).toHaveBeenCalledTimes(1);
  });

  it("is idempotent on replay: still one order and no duplicate emails", async () => {
    const payload = event("checkout.session.completed", checkoutSession());
    await post(payload);
    const emailsAfterFirst = mocks.sendTemplateEmail.mock.calls.length;

    const replay = await post(payload);
    const asyncSucceeded = await post(
      event("checkout.session.async_payment_succeeded", checkoutSession()),
    );

    expect(replay.status).toBe(200);
    expect(asyncSucceeded.status).toBe(200);
    expect(mocks.db.tables["orders"]).toHaveLength(1);
    expect(mocks.db.tables["orders"][0].emails_sent).toBe(true);
    expect(mocks.sendTemplateEmail).toHaveBeenCalledTimes(emailsAfterFirst);
  });

  it("does not fulfil an unpaid (delayed payment method) session", async () => {
    const res = await post(
      event("checkout.session.completed", checkoutSession({ payment_status: "unpaid" })),
    );
    expect(res.status).toBe(200);
    expect(orderUpserts()).toHaveLength(0);
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("ignores a sandbox checkout on a live deployment", async () => {
    mocks.resolvePaymentsEnv.mockReturnValue("live");
    const res = await post(event("checkout.session.completed", checkoutSession()));
    expect(res.status).toBe(200);
    expect(orderUpserts()).toHaveLength(0);
    expect(mocks.settleCommissionBalance).not.toHaveBeenCalled();
    expect(mocks.fulfillPaidDiscoveryBooking).not.toHaveBeenCalled();
  });

  it("returns 500 so Stripe retries when the order cannot be recorded", async () => {
    mocks.db.failures.push({ table: "orders", op: "upsert", message: "db down" });
    const res = await post(event("checkout.session.completed", checkoutSession()));
    expect(res.status).toBe(500);
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("records no order when a discovery call payment was refunded", async () => {
    mocks.fulfillPaidDiscoveryBooking.mockResolvedValue({ status: "refunded" });
    const session = checkoutSession({ metadata: { purpose: "discovery_call" } });

    const res = await post(event("checkout.session.completed", session));

    expect(res.status).toBe(200);
    expect(mocks.fulfillPaidDiscoveryBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cs_test_order",
        paymentIntentId: "pi_test_order",
        env: "sandbox",
      }),
    );
    expect(orderUpserts()).toHaveLength(0);
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("routes a balance payment to settlement instead of creating an order", async () => {
    const session = checkoutSession({
      metadata: { purpose: "commission_balance", order_id: "order_1" },
    });
    const res = await post(event("checkout.session.completed", session));
    expect(res.status).toBe(200);
    expect(mocks.settleCommissionBalance).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "cs_test_order", env: "sandbox", livemode: false }),
    );
    expect(orderUpserts()).toHaveLength(0);
  });
});

describe("resolveUserId (via checkout.session.completed)", () => {
  const profiles = [{ id: "profile_by_email", email: "buyer@example.com" }];

  it("prefers the metadata user id over an email match", async () => {
    mocks.db = createFakeDb({ profiles });
    mocks.sessionsRetrieve.mockResolvedValue({
      ...checkoutSession({ metadata: { user_id: "user_from_metadata" } }),
      line_items: { data: [] },
    });

    await post(event("checkout.session.completed", checkoutSession()));

    expect(mocks.db.tables["orders"][0].user_id).toBe("user_from_metadata");
    expect(mocks.db.calls.some((c: Row) => c["table"] === "profiles")).toBe(false);
  });

  it("falls back to a case-insensitive email match when metadata has no user id", async () => {
    mocks.db = createFakeDb({ profiles });

    await post(event("checkout.session.completed", checkoutSession()));

    const lookup = mocks.db.calls.find((c: Row) => c["table"] === "profiles");
    expect(lookup.filters).toEqual([["email", "eq", "buyer@example.com"]]);
    expect(mocks.db.tables["orders"][0].user_id).toBe("profile_by_email");
  });

  it("stores a null user id when neither metadata nor email resolve", async () => {
    mocks.sessionsRetrieve.mockResolvedValue({
      ...checkoutSession({ customer_details: null, customer_email: null }),
      line_items: { data: [] },
    });

    await post(event("checkout.session.completed", checkoutSession()));

    expect(mocks.db.tables["orders"][0].user_id).toBeNull();
    expect(mocks.db.calls.some((c: Row) => c["table"] === "profiles")).toBe(false);
  });
});

describe("charge.refunded", () => {
  const seedOrders = () =>
    createFakeDb({
      orders: [
        { id: "o1", stripe_payment_intent_id: "pi_r", environment: "sandbox", payment_status: "paid" },
        { id: "o2", stripe_payment_intent_id: "pi_r", environment: "live", payment_status: "paid" },
      ],
    });

  it("marks a fully refunded charge as refunded, scoped to the environment", async () => {
    mocks.db = seedOrders();
    const res = await post(
      event("charge.refunded", { payment_intent: "pi_r", amount: 5000, amount_refunded: 5000 }),
    );
    expect(res.status).toBe(200);
    const [sandbox, live] = mocks.db.tables["orders"];
    expect(sandbox).toMatchObject({ payment_status: "refunded", amount_refunded: 5000 });
    expect(live.payment_status).toBe("paid");
  });

  it("marks a partial refund as partially_refunded", async () => {
    mocks.db = seedOrders();
    await post(
      event("charge.refunded", { payment_intent: "pi_r", amount: 5000, amount_refunded: 1000 }),
    );
    expect(mocks.db.tables["orders"][0]).toMatchObject({
      payment_status: "partially_refunded",
      amount_refunded: 1000,
    });
  });

  it("does nothing for a charge with no payment intent", async () => {
    const res = await post(event("charge.refunded", { payment_intent: null, amount: 5000 }));
    expect(res.status).toBe(200);
    expect(mocks.db.calls).toHaveLength(0);
  });
});
