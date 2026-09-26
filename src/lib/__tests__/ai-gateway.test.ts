import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import {
  generateDraftText,
  resolveDraftingChain,
  type DraftingProvider,
  type DraftingSource,
} from "@/lib/ai-gateway.server";

const ok = (text: string) =>
  new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: "text", text }],
      finishReason: { unified: "stop", raw: "stop" },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 1, text: 1, reasoning: 0 },
      },
      warnings: [],
    }),
  });

const failing = (statusCode: number) =>
  new MockLanguageModelV4({
    doGenerate: async () => {
      throw Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });
    },
  });

const entry = (source: DraftingSource, model: MockLanguageModelV4): DraftingProvider => ({
  source,
  model: `${source}-model`,
  provider: () => model,
});

const input = { system: "sys", prompt: "hi" };

describe("resolveDraftingChain", () => {
  it("orders the paid gateway first, then no-training free tiers before the rest", () => {
    const chain = resolveDraftingChain({
      OPENROUTER_API_KEY: "x",
      GOOGLE_API_KEY: "x",
      CLOUDFLARE_API_TOKEN: "x",
      CLOUDFLARE_ACCOUNT_ID: "acct",
      GROQ_API_KEY: "x",
      LOVABLE_API_KEY: "x",
    });
    expect(chain.map((p) => p.source)).toEqual([
      "lovable",
      "groq",
      "cloudflare",
      "google",
      "openrouter",
    ]);
  });

  it("skips providers without keys, and Cloudflare without an account id", () => {
    const chain = resolveDraftingChain({ GROQ_API_KEY: "x", CLOUDFLARE_API_TOKEN: "x" });
    expect(chain.map((p) => p.source)).toEqual(["groq"]);
  });
});

describe("generateDraftText", () => {
  it("uses the first provider when it succeeds", async () => {
    const result = await generateDraftText(input, [
      entry("lovable", ok("hello")),
      entry("groq", ok("nope")),
    ]);
    expect(result).toEqual({ text: "hello", model: "lovable-model", source: "lovable" });
  });

  it("falls through to the next provider when Lovable credits run out", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await generateDraftText(input, [
      entry("lovable", failing(402)),
      entry("groq", failing(429)),
      entry("cloudflare", ok("drafted")),
    ]);
    expect(result).toEqual({
      text: "drafted",
      model: "cloudflare:cloudflare-model",
      source: "cloudflare",
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("lovable 402, groq 429"));
    warn.mockRestore();
  });

  it("treats an empty response as a failure", async () => {
    const result = await generateDraftText(input, [
      entry("groq", ok("  ")),
      entry("google", ok("real")),
    ]);
    expect(result.source).toBe("google");
  });

  it("throws with the primary provider's status when every provider fails", async () => {
    await expect(
      generateDraftText(input, [entry("lovable", failing(402)), entry("groq", failing(500))]),
    ).rejects.toMatchObject({
      status: 402,
      message: expect.stringContaining("All AI providers failed"),
    });
  });

  it("throws a clear error when nothing is configured", async () => {
    await expect(generateDraftText(input, [])).rejects.toThrow("No AI provider configured");
  });
});
