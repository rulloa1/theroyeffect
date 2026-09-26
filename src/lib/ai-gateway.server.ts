import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, RetryError } from "ai";

/**
 * Server-only: builds the Lovable AI Gateway provider.
 * Never import this from client code.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

/** Direct Google Gemini provider via its OpenAI-compatible endpoint. */
export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey,
  });
}

export type DraftingSource = "lovable" | "groq" | "cloudflare" | "google" | "openrouter";

export interface DraftingProvider {
  source: DraftingSource;
  model: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: (model: string) => any;
}

type Env = Record<string, string | undefined>;

/**
 * Ordered provider chain for drafting jobs: the paid Lovable AI Gateway first,
 * then free-tier providers whose keys are configured. Free tiers that don't
 * train on prompts (Groq, Cloudflare) come before those that may (Gemini free
 * tier, OpenRouter's free models), since drafts carry client details.
 */
export function resolveDraftingChain(env: Env = process.env): DraftingProvider[] {
  const chain: DraftingProvider[] = [];
  const add = (source: DraftingSource, model: string, baseURL: string, apiKey: string) =>
    chain.push({
      source,
      model,
      provider: createOpenAICompatible({ name: source, baseURL, apiKey }),
    });

  if (env["LOVABLE_API_KEY"]) {
    chain.push({
      source: "lovable",
      model: "google/gemini-3.8-flash",
      provider: createLovableAiGatewayProvider(env["LOVABLE_API_KEY"]),
    });
  }
  if (env["GROQ_API_KEY"]) {
    add("groq", "openai/gpt-oss-120b", "https://api.groq.com/openai/v1", env["GROQ_API_KEY"]);
  }
  if (env["CLOUDFLARE_API_TOKEN"] && env["CLOUDFLARE_ACCOUNT_ID"]) {
    add(
      "cloudflare",
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      `https://api.cloudflare.com/client/v4/accounts/${env["CLOUDFLARE_ACCOUNT_ID"]}/ai/v1`,
      env["CLOUDFLARE_API_TOKEN"],
    );
  }
  if (env["GOOGLE_API_KEY"]) {
    chain.push({
      source: "google",
      model: "gemini-3.8-flash",
      provider: createGeminiProvider(env["GOOGLE_API_KEY"]),
    });
  }
  if (env["OPENROUTER_API_KEY"]) {
    add(
      "openrouter",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "https://openrouter.ai/api/v1",
      env["OPENROUTER_API_KEY"],
    );
  }
  return chain;
}

/** Thrown when the gateway refuses the request in a way that must halt a batch job. */
export class AiGatewayBlockedError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AiGatewayBlockedError";
  }
}

/** Extracts an HTTP status from an AI SDK error, when present. */
export function statusFromAiError(error: unknown): number | null {
  const inner = RetryError.isInstance(error) ? error.lastError : error;
  const candidate = inner as { statusCode?: number; status?: number } | null;
  return candidate?.statusCode ?? candidate?.status ?? null;
}

/**
 * Generates text by walking the provider chain until one succeeds. When every
 * provider fails, the thrown error carries the first provider's HTTP status so
 * callers' 402/403 handling still reflects the primary (Lovable) account.
 */
export async function generateDraftText(
  input: { system: string; prompt: string },
  chain: DraftingProvider[] = resolveDraftingChain(),
): Promise<{ text: string; model: string; source: DraftingSource }> {
  if (chain.length === 0) {
    throw new Error(
      "No AI provider configured: set LOVABLE_API_KEY or a free-tier key (GROQ_API_KEY, CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID, GOOGLE_API_KEY, OPENROUTER_API_KEY)",
    );
  }

  const failures: { source: DraftingSource; status: number | null; message: string }[] = [];
  for (const entry of chain) {
    try {
      const { text } = await generateText({
        model: entry.provider(entry.model),
        system: input.system,
        prompt: input.prompt,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(90_000),
      });
      if (!text.trim()) throw new Error("empty response");
      if (failures.length > 0) {
        console.warn(
          `[ai] drafted via ${entry.source} after: ${failures.map((f) => `${f.source} ${f.status ?? "error"}`).join(", ")}`,
        );
      }
      return {
        text,
        model: entry.source === "lovable" ? entry.model : `${entry.source}:${entry.model}`,
        source: entry.source,
      };
    } catch (error) {
      failures.push({
        source: entry.source,
        status: statusFromAiError(error),
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const summary = failures
    .map((f) => `${f.source} (${f.status ?? "error"}): ${f.message}`)
    .join("; ");
  const error = new Error(`All AI providers failed — ${summary}`) as Error & { status?: number };
  const status = failures[0]?.status;
  if (status) error.status = status;
  throw error;
}
