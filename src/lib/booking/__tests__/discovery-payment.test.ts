import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, any>;
type Filter = [field: string, op: "eq" | "neq" | "ilike", value: unknown];

/** Minimal chainable, in-memory stand-in for the supabase-js query builder. */
function createFakeDb(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((r) => ({ ...r }));
  const calls: { table: string; op: string; payload?: Row | undefined; filters: Filter[] }[] = [];

  function from(table: string) {
    const rows = (tables[table] ??= []);
    let op = "select";
    let payload: Row | undefined;
    const filters: Filter[] = [];

    const matches = (r: Row) =>
      filters.every(([k, f, v]) =>
        f === "eq"
          ? r[k] === v
          : f === "neq"
            ? r[k] !== v
            : String(r[k]).toLowerCase() === String(v).toLowerCase(),
      );

    const runQuery = () => {
      calls.push({ table, op, payload, filters: [...filters] });
      if (op === "insert") {
        const row = { id: `${table}-${rows.length + 1}`, ...payload };
        rows.push(row);
        return { data: [row], error: null };
      }
      if (op === "update") {
        const hit = rows.filter(matches);
        hit.forEach((r) => Object.assign(r, payload));
        return { data: hit, error: null };
      }
      return { data: rows.filter(matches), error: null };
    };
    const first = () => {
      const res = runQuery();
      return { data: res.data[0] ?? null, error: res.error };
    };

    const builder: any = {
      select: () => builder,
      insert: (p: Row) => ((op = "insert"), (payload = p), builder),
      update: (p: Row) => ((op = "update"), (payload = p), builder),
      eq: (k: string, v: unknown) => (filters.push([k, "eq", v]), builder),
      neq: (k: string, v: unknown) => (filters.push([k, "neq", v]), builder),
      ilike: (k: string, v: unknown) => (filters.push([k, "ilike", v]), builder),
      order: () => builder,
      limit: () => builder,
      maybeSingle: async () => first(),
      single: async () => first(),
      then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve().then(runQuery).then(res, rej),
    };
    return builder;
  }

  return { from, tables, calls };
}

const mocks = vi.hoisted(() => ({
  db: null as any,
  bookDiscoverySlot: vi.fn(),
  sendTemplateEmail: vi.fn(),
  refundsCreate: vi.fn(),
  createStripeClient: vi.fn(),
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: (t: string) => mocks.db.from(t) },
}));
vi.mock("@/lib/email-templates/send-email", () => ({
  sendTemplateEmail: (...args: unknown[]) => mocks.sendTemplateEmail(...args),
}));
vi.mock("@/lib/stripe.server", () => ({
  createStripeClient: (env: string) => mocks.createStripeClient(env),
}));
vi.mock("@/utils/booking.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/booking.server")>()),
  bookDiscoverySlot: (...args: unknown[]) => mocks.bookDiscoverySlot(...args),
}));

const { fulfillPaidDiscoveryBooking, DISCOVERY_FEE_CENTS } =
  await import("@/lib/booking/discovery-payment.server");
const { SLOT_TAKEN_MESSAGE, OWNER_EMAIL } = await import("@/utils/booking.server");

const SLOT = "2026-09-15T15:00:00.000Z";

type Session = Parameters<typeof fulfillPaidDiscoveryBooking>[0];

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: "cs_test_123",
    amountTotal: DISCOVERY_FEE_CENTS,
    currency: "usd",
    email: "client@example.com",
    paymentIntentId: "pi_test_123",
    env: "sandbox",
    metadata: {
      purpose: "discovery_call",
      slot_start: SLOT,
      full_name: "Casey Client",
      email: "client@example.com",
      time_zone: "America/Chicago",
    },
    ...overrides,
  };
}

beforeEach(() => {
  mocks.db = createFakeDb();
  mocks.bookDiscoverySlot.mockReset();
  mocks.sendTemplateEmail.mockReset().mockResolvedValue({ ok: true });
  mocks.refundsCreate.mockReset().mockResolvedValue({ id: "re_test_1", status: "succeeded" });
  mocks.createStripeClient
    .mockReset()
    .mockImplementation(() => ({ refunds: { create: mocks.refundsCreate } }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("fulfillPaidDiscoveryBooking — auto-refund when the slot is lost", () => {
  it("issues exactly one refund for the payment intent and reports it as refunded", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result.status).toBe("refunded");
    expect(result.message).toMatch(/refunded/);
    expect(mocks.createStripeClient).toHaveBeenCalledWith("sandbox");
    expect(mocks.refundsCreate).toHaveBeenCalledTimes(1);
    const [params] = mocks.refundsCreate.mock.calls[0]!;
    expect(params).toEqual({
      payment_intent: "pi_test_123",
      reason: "requested_by_customer",
      metadata: { purpose: "discovery_call_unbookable", checkout_session_id: "cs_test_123" },
    });
  });

  it("passes a Stripe idempotency key derived from the checkout session id", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    await fulfillPaidDiscoveryBooking(session());

    const [, requestOptions] = mocks.refundsCreate.mock.calls[0]!;
    expect(requestOptions).toEqual({ idempotencyKey: "discovery-refund-cs_test_123" });
  });

  it("uses the environment the payment was made in to build the Stripe client", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));
    await fulfillPaidDiscoveryBooking(session({ env: "live" }));
    expect(mocks.createStripeClient).toHaveBeenCalledWith("live");
  });

  it.each([
    "That time was just taken.",
    "That time is no longer available.",
    "That time isn't one of the slots on offer.",
  ])("treats %j as unbookable and refunds", async (message) => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(message));
    const result = await fulfillPaidDiscoveryBooking(session());
    expect(result.status).toBe("refunded");
    expect(mocks.refundsCreate).toHaveBeenCalledTimes(1);
  });

  it("tells the owner about the refund, with its own idempotency key", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    await fulfillPaidDiscoveryBooking(session());

    expect(mocks.sendTemplateEmail).toHaveBeenCalledTimes(1);
    const [template, to, options] = mocks.sendTemplateEmail.mock.calls[0]!;
    expect(template).toBe("booking-notification");
    expect(to).toBe(OWNER_EMAIL);
    expect(options.idempotencyKey).toBe("discovery-refund-notice-cs_test_123");
    expect(options.templateData.when).toMatch(/^NOT BOOKED/);
    expect(options.templateData.email).toBe("client@example.com");
  });

  it("still reports refunded when the owner notice email fails", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));
    mocks.sendTemplateEmail.mockRejectedValue(new Error("smtp down"));

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result.status).toBe("refunded");
    expect(mocks.refundsCreate).toHaveBeenCalledTimes(1);
  });
});

describe("fulfillPaidDiscoveryBooking — double-refund protection", () => {
  it("does not refund (or rebook) when the session already has a booking row", async () => {
    mocks.db = createFakeDb({
      voice_bookings: [
        { id: "vb_1", stripe_session_id: "cs_test_123", slot_start: SLOT, time_zone: "UTC" },
      ],
    });

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result).toMatchObject({
      status: "already_booked",
      bookingId: "vb_1",
      timeZone: "America/Chicago",
    });
    expect(mocks.bookDiscoverySlot).not.toHaveBeenCalled();
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
  });

  it("does not refund when the concurrent fulfilment path booked the slot first", async () => {
    mocks.bookDiscoverySlot.mockResolvedValue({
      already_booked: true,
      booking_id: "vb_2",
      spoken_time: "Tuesday at 10:00 AM",
      time_zone: "America/Chicago",
    });

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result).toMatchObject({ status: "already_booked", bookingId: "vb_2" });
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("sends the same idempotency keys when the webhook and return page both hit a lost slot", async () => {
    // A refunded session leaves no booking row, so the second caller reaches Stripe
    // again. The only thing preventing a second refund is the Stripe idempotency key,
    // so it must be identical across calls for the same session.
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    const first = await fulfillPaidDiscoveryBooking(session());
    const second = await fulfillPaidDiscoveryBooking(session());

    expect(first.status).toBe("refunded");
    expect(second.status).toBe("refunded");
    const keys = mocks.refundsCreate.mock.calls.map(([, opts]) => opts.idempotencyKey);
    expect(keys).toEqual(["discovery-refund-cs_test_123", "discovery-refund-cs_test_123"]);
    const noticeKeys = mocks.sendTemplateEmail.mock.calls.map(([, , opts]) => opts.idempotencyKey);
    expect(new Set(noticeKeys)).toEqual(new Set(["discovery-refund-notice-cs_test_123"]));
  });

  it("uses a different idempotency key for a different checkout session", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    await fulfillPaidDiscoveryBooking(session({ id: "cs_a" }));
    await fulfillPaidDiscoveryBooking(session({ id: "cs_b" }));

    const keys = mocks.refundsCreate.mock.calls.map(([, opts]) => opts.idempotencyKey);
    expect(keys).toEqual(["discovery-refund-cs_a", "discovery-refund-cs_b"]);
  });
});

describe("fulfillPaidDiscoveryBooking — refund failure handling", () => {
  it("returns invalid (not refunded) and sends no notice when Stripe rejects the refund", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));
    mocks.refundsCreate.mockRejectedValue(new Error("charge_already_refunded"));

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result).toEqual({ status: "invalid", message: SLOT_TAKEN_MESSAGE });
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("REFUND REQUIRED"),
      expect.any(Error),
    );
  });

  it("returns invalid without throwing when the Stripe client cannot be created", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));
    mocks.createStripeClient.mockImplementation(() => {
      throw new Error("missing api key");
    });

    await expect(fulfillPaidDiscoveryBooking(session())).resolves.toEqual({
      status: "invalid",
      message: SLOT_TAKEN_MESSAGE,
    });
    expect(mocks.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("cannot refund without a payment intent id and reports invalid", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error(SLOT_TAKEN_MESSAGE));

    const result = await fulfillPaidDiscoveryBooking(session({ paymentIntentId: null }));

    expect(result.status).toBe("invalid");
    expect(mocks.createStripeClient).not.toHaveBeenCalled();
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
  });

  it("does not refund for a retryable booking error (e.g. a database failure)", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue(new Error("connection reset"));

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result).toEqual({ status: "invalid", message: "connection reset" });
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
  });

  it("does not refund when a non-Error is thrown", async () => {
    mocks.bookDiscoverySlot.mockRejectedValue("boom");
    const result = await fulfillPaidDiscoveryBooking(session());
    expect(result).toEqual({ status: "invalid", message: "Booking failed" });
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
  });
});

describe("fulfillPaidDiscoveryBooking — payment validation", () => {
  it("rejects a session that is not a discovery call", async () => {
    const s = session();
    const result = await fulfillPaidDiscoveryBooking({
      ...s,
      metadata: { ...s.metadata, purpose: "commission" },
    });
    expect(result.status).toBe("invalid");
    expect(mocks.bookDiscoverySlot).not.toHaveBeenCalled();
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
  });

  it("rejects a payment below the discovery fee", async () => {
    const result = await fulfillPaidDiscoveryBooking(
      session({ amountTotal: DISCOVERY_FEE_CENTS - 1 }),
    );
    expect(result.status).toBe("invalid");
    expect(mocks.bookDiscoverySlot).not.toHaveBeenCalled();
  });

  it.each(["slot_start", "full_name"])("rejects a session missing %s", async (key) => {
    const s = session();
    const metadata = { ...s.metadata, [key]: undefined };
    const result = await fulfillPaidDiscoveryBooking({ ...s, metadata });
    expect(result.status).toBe("invalid");
    expect(mocks.bookDiscoverySlot).not.toHaveBeenCalled();
  });

  it("books the slot with the payment details and syncs the portal milestone", async () => {
    mocks.bookDiscoverySlot.mockResolvedValue({
      already_booked: false,
      booking_id: "vb_new",
      spoken_time: "Tuesday at 10:00 AM",
      time_zone: "America/Chicago",
    });

    const result = await fulfillPaidDiscoveryBooking(session());

    expect(result).toEqual({
      status: "booked",
      bookingId: "vb_new",
      spokenTime: "Tuesday at 10:00 AM",
      timeZone: "America/Chicago",
    });
    const [, payment] = mocks.bookDiscoverySlot.mock.calls[0]!;
    expect(payment).toMatchObject({
      stripe_session_id: "cs_test_123",
      amount_paid_cents: DISCOVERY_FEE_CENTS,
      currency: "usd",
    });
    expect(mocks.refundsCreate).not.toHaveBeenCalled();
    expect(mocks.db.tables["client_projects"]).toHaveLength(1);
    expect(mocks.db.tables["client_milestones"][0]).toMatchObject({
      title: "Discovery call",
      status: "done",
    });
  });
});
