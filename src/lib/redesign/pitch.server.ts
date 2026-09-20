/**
 * Final pipeline stage: the outreach email that ships with the redesign.
 * Voiced like the prospecting outreach drafter, but this pitch has a real
 * rebuilt page behind it, so it leads with the page rather than a report.
 */

import { streamText } from "ai";
import {
  AiGatewayBlockedError,
  resolveDraftingProvider,
  statusFromAiError,
} from "@/lib/ai-gateway.server";
import { parseJsonObject } from "./design.server";
import type { PitchAngle, PitchTone, RedesignChange, SiteAudit, SiteCapture } from "./types";
import { PITCH_ANGLES } from "./types";

const SYSTEM = `You write short cold outreach emails for Rory Ulloa, a Houston-based creative director and no-code developer at The Roy Effect (theroyeffect.com). He designs and builds websites for local businesses.

This email is different from a normal cold email: Rory has already rebuilt their homepage, and the link in it is a real hosted page, not a mockup. Say that plainly.

Voice: direct, human, specific, confident. No hype, no emoji, no exclamation marks, no "I hope this finds you well", no agency jargon, no flattery.
Rules:
- Open by naming what he did, or the single biggest concrete problem on their site. Be factual, never insulting.
- Name at most three specific problems the rebuild fixes. Only problems you were given.
- Do not paste any URL — the link is added separately as a button.
- Under 130 words. Short paragraphs. Sign off as "— Rory" and nothing more.
- Never invent prices, timelines, guarantees, client names, or facts you were not given.

Reply with ONLY a JSON object: {"subject": string, "body": string, "rationale": string}. No markdown fence, no commentary.`;

const TONE_BRIEF: Record<PitchTone, string> = {
  shorter: "Rewrite it shorter — under 85 words, same substance, nothing padded.",
  warmer:
    "Rewrite it warmer — still direct and unsentimental, but read like one person writing to another rather than a report.",
  more_direct:
    "Rewrite it more direct — lead with the cost of the problem, cut every hedge and qualifier.",
  add_pricing:
    "Add one line about what a rebuild like this costs. Do not name a figure you were not given; say the price is on the page or offer to send it, whichever reads straighter.",
};

export interface PitchDraft {
  subject: string;
  body: string;
  rationale: string;
}

const pick = (obj: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export function parsePitchResponse(raw: string): PitchDraft {
  const obj = parseJsonObject(raw);
  const subject = pick(obj, ["subject", "subjectLine", "subject_line", "title"]);
  const body = pick(obj, ["body", "emailBody", "email_body", "message", "content"]);
  if (!subject || !body) throw new Error("AI pitch missing subject or body");
  return {
    subject: subject.slice(0, 140),
    body: body.slice(0, 4000),
    rationale: pick(obj, ["rationale", "reason", "why", "reasoning"]).slice(0, 500),
  };
}

export async function generatePitch(input: {
  capture: SiteCapture;
  audit: SiteAudit;
  changes: RedesignChange[];
  angle: PitchAngle;
  host: string;
  /** Present when regenerating from an existing draft. */
  previous?: { subject: string; body: string } | null;
  tone?: PitchTone | null;
}): Promise<PitchDraft> {
  const { provider, model } = resolveDraftingProvider();
  const angleBrief = PITCH_ANGLES.find((a) => a.key === input.angle)?.brief ?? "";
  const firstName = input.capture.contactEmail?.split("@")[0]?.replace(/[._-].*$/, "") ?? null;

  const prompt = [
    `Business: ${input.capture.businessName ?? input.host}`,
    `Their site: ${input.host}`,
    firstName && /^[a-z]{2,20}$/i.test(firstName)
      ? `Their contact's first name appears to be "${firstName}" — greet them by it if it reads like a real first name, otherwise greet the business.`
      : "No contact name is known — address the business, not a person.",
    `Angle to lead with: ${angleBrief}`,
    "Problems found (most severe first):",
    input.audit.signals
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .map((s) => `- ${s.label}: ${s.detail}`)
      .join("\n") || "- No specific issues recorded.",
    input.changes.length
      ? `What the rebuild changed:\n${input.changes.map((c) => `- ${c.text}`).join("\n")}`
      : "",
    input.previous
      ? `The current draft is:\nSubject: ${input.previous.subject}\n\n${input.previous.body}`
      : "",
    input.tone ? TONE_BRIEF[input.tone] : "",
    "Write the subject line (under 55 characters, plain and specific, no clickbait), the email body, and a one-sentence rationale for Rory.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = streamText({ model: provider(model), system: SYSTEM, prompt });
    return parsePitchResponse(await result.text);
  } catch (error) {
    const status = statusFromAiError(error);
    if (status === 402 || status === 403) {
      throw new AiGatewayBlockedError(status, "AI drafting is blocked on this account");
    }
    throw error;
  }
}
