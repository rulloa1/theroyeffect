import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePaymentsEnv, sessionMatchesEnv } from "@/lib/stripe.server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolvePaymentsEnv", () => {
  it("transacts live only when a live key is configured", () => {
    vi.stubEnv("STRIPE_LIVE_API_KEY", "live-key");
    expect(resolvePaymentsEnv()).toBe("live");
  });

  it("falls back to sandbox when no live key is configured", () => {
    vi.stubEnv("STRIPE_LIVE_API_KEY", "");
    expect(resolvePaymentsEnv()).toBe("sandbox");
  });
});

describe("sessionMatchesEnv", () => {
  it("rejects a test-mode session in a live deployment", () => {
    expect(sessionMatchesEnv({ livemode: false }, "live")).toBe(false);
  });

  it("rejects a live-mode session in a sandbox deployment", () => {
    expect(sessionMatchesEnv({ livemode: true }, "sandbox")).toBe(false);
  });

  it("accepts sessions created in the matching environment", () => {
    expect(sessionMatchesEnv({ livemode: true }, "live")).toBe(true);
    expect(sessionMatchesEnv({ livemode: false }, "sandbox")).toBe(true);
  });
});
