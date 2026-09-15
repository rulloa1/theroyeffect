import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, any>;

const mocks = vi.hoisted(() => ({
  orders: [] as Record<string, any>[],
  updateError: null as { message: string } | null,
  calls: [] as {
    op: string;
    payload?: Record<string, any> | undefined;
    filters: [string, string, unknown][];
  }[],
}));

/** Chainable fake of `supabaseAdmin.from("orders")` backed by `mocks.orders`. */
function ordersBuilder() {
  let op = "select";
  let payload: Row | undefined;
  const filters: [string, string, unknown][] = [];
  const matches = (r: Row) =>
    filters.every(([k, f, v]) => (f === "eq" ? r[k] === v : r[k] !== v));
  const runQuery = () => {
    mocks.calls.push({ op, payload, filters: [...filters] });
    if (op === "update") {
      if (mocks.updateError) return { data: null, error: mocks.updateError };
      const hit = mocks.orders.filter(matches);
      hit.forEach((r) => Object.assign(r, payload));
      return { data: hit, error: null };
    }
    return { data: mocks.orders.filter(matches), error: null };
  };
  const builder: any = {
    select: () => builder,
    update: (p: Row) => ((op = "update"), (payload = p), builder),
    eq: (k: string, v: unknown) => (filters.push([k, "eq", v]), builder),
    neq: (k: string, v: unknown) => (filters.push([k, "neq", v]), builder),
    maybeSingle: async () => {
      const res = runQuery();
      return { data: (res.data as Row[])[0] ?? null, error: res.error };
    },
    then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
      Promise.resolve().then(runQuery).then(res, rej),
  };
  return builder;
}

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table !== "orders") throw new Error(`unexpected table ${table}`);
      return ordersBuilder();
    },
  },
}));

const { settleCommissionBalance } = await import("@/lib/booking/balance-payment.server");

type Input = Parameters<typeof settleCommissionBalance>[0];

function input(overrides: Partial<Input> = {}): Input {
  return {
    sessionId: "cs_balance_1",
    amountTotal: 150000,
    env: "sandbox",
    livemode: false,
    metadata: { purpose: "commission_balance", order_id: "order_1", user_id: "user_1" },
    ...overrides,
  };
}

const updates = () => mocks.calls.filter((c) => c.op === "update");

beforeEach(() => {
  mocks.orders = [
    {
      id: "order_1",
      environment: "sandbox",
      balance_status: "pending",
      balance_due_cents: 150000,
    },
  ];
  mocks.updateError = null;
  mocks.calls = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("settleCommissionBalance — rejections", () => {
  it.each([undefined, "commission", "discovery_call", "proposal_deposit"])(
    "rejects purpose %j without touching the database",
    async (purpose) => {
      const result = await settleCommissionBalance(
        input({ metadata: { purpose, order_id: "order_1", user_id: "user_1" } }),
      );
      expect(result).toEqual({ settled: false, reason: "That payment was not a balance payment" });
      expect(mocks.calls).toHaveLength(0);
    },
  );

  it("rejects a test-mode payment against a live order", async () => {
    const result = await settleCommissionBalance(input({ env: "live", livemode: false }));
    expect(result).toEqual({
      settled: false,
      reason: "That payment was not made in this environment",
    });
    expect(mocks.calls).toHaveLength(0);
  });

  it("rejects a live payment in the sandbox environment", async () => {
    const result = await settleCommissionBalance(input({ env: "sandbox", livemode: true }));
    expect(result.settled).toBe(false);
    expect(result.reason).toBe("That payment was not made in this environment");
    expect(mocks.calls).toHaveLength(0);
  });

  it("rejects a payment that belongs to a different signed-in client", async () => {
    const result = await settleCommissionBalance(input({ expectedUserId: "user_2" }));
    expect(result).toEqual({
      settled: false,
      reason: "That payment belongs to a different account",
    });
    expect(mocks.calls).toHaveLength(0);
  });

  it("rejects an owner check when the session carries no user id", async () => {
    const result = await settleCommissionBalance(
      input({
        expectedUserId: "user_1",
        metadata: { purpose: "commission_balance", order_id: "order_1" },
      }),
    );
    expect(result.reason).toBe("That payment belongs to a different account");
    expect(mocks.calls).toHaveLength(0);
  });

  it("rejects a payment not linked to an order", async () => {
    const result = await settleCommissionBalance(
      input({ metadata: { purpose: "commission_balance", user_id: "user_1" } }),
    );
    expect(result).toEqual({ settled: false, reason: "That payment is not linked to an order" });
  });

  it("does not find an order that belongs to the other environment", async () => {
    mocks.orders[0]!["environment"] = "live";
    const result = await settleCommissionBalance(input());
    expect(result).toEqual({ settled: false, reason: "Order not found" });
    const lookup = mocks.calls[0]!;
    expect(lookup.filters).toContainEqual(["environment", "eq", "sandbox"]);
    expect(updates()).toHaveLength(0);
  });

  it("rejects an amount below the balance owed and leaves the order pending", async () => {
    const result = await settleCommissionBalance(input({ amountTotal: 149999 }));
    expect(result).toEqual({
      settled: false,
      reason: "That payment does not cover the balance owed",
    });
    expect(updates()).toHaveLength(0);
    expect(mocks.orders[0]!["balance_status"]).toBe("pending");
  });

  it("reports a failed write as not settled", async () => {
    mocks.updateError = { message: "permission denied" };
    const result = await settleCommissionBalance(input());
    expect(result).toEqual({ settled: false, reason: "Recording the payment failed" });
  });
});

describe("settleCommissionBalance — settlement", () => {
  it("marks the order paid for the exact balance owed, guarded against re-settling", async () => {
    const result = await settleCommissionBalance(input({ expectedUserId: "user_1" }));

    expect(result).toEqual({ settled: true });
    const [update] = updates();
    expect(update!.payload).toMatchObject({
      balance_status: "paid",
      balance_session_id: "cs_balance_1",
      balance_paid_cents: 150000,
    });
    expect(update!.filters).toEqual([
      ["id", "eq", "order_1"],
      ["balance_status", "neq", "paid"],
    ]);
    expect(mocks.orders[0]!["balance_status"]).toBe("paid");
  });

  it("accepts an overpayment and records the amount actually paid", async () => {
    await expect(settleCommissionBalance(input({ amountTotal: 200000 }))).resolves.toEqual({
      settled: true,
    });
    expect(updates()[0]!.payload!["balance_paid_cents"]).toBe(200000);
  });

  it("accepts a live payment against a live order", async () => {
    mocks.orders[0]!["environment"] = "live";
    await expect(settleCommissionBalance(input({ env: "live", livemode: true }))).resolves.toEqual({
      settled: true,
    });
  });

  it("is idempotent: an already-paid order returns settled without writing again", async () => {
    await settleCommissionBalance(input());
    mocks.calls = [];

    const replay = await settleCommissionBalance(input({ sessionId: "cs_balance_retry" }));

    expect(replay).toEqual({ settled: true });
    expect(updates()).toHaveLength(0);
    expect(mocks.orders[0]!["balance_session_id"]).toBe("cs_balance_1");
  });

  it("treats a missing balance_due_cents as zero owed", async () => {
    mocks.orders[0]!["balance_due_cents"] = null;
    await expect(settleCommissionBalance(input({ amountTotal: 0 }))).resolves.toEqual({
      settled: true,
    });
  });
});
