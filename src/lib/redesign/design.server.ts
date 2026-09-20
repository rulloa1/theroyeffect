/**
 * Generation stages of the Redesign Studio pipeline. Three separate model calls
 * — direction, hero, sections — so each pipeline step does real work and the
 * progress the admin sees is the progress that happened.
 */

import { streamText } from "ai";
import {
  AiGatewayBlockedError,
  resolveDraftingProvider,
  statusFromAiError,
} from "@/lib/ai-gateway.server";
import type {
  PitchAngle,
  RedesignChange,
  RedesignSection,
  RedesignSpec,
  SiteAudit,
  SiteCapture,
  Treatment,
} from "./types";
import { PITCH_ANGLES, treatmentLabel } from "./types";

/** The Refinery tokens the cinematic system is built on. */
const REFINERY = {
  ground: "#0a0a0a",
  ink: "#f5f2ec",
  accent: "#ff3333",
  gold: "#dfba73",
} as const;

const REFINERY_TYPE = {
  display: "Space Grotesk",
  body: "Archivo",
  mono: "IBM Plex Mono",
} as const;

const VOICE = `You are the design brain behind The Roy Effect (theroyeffect.com), Rory Ulloa's Houston studio. You rebuild local-business homepages in a cinematic system: near-black ground, warm off-white ink, a furnace red accent, a refined gold, square corners, hairline rules, big uppercase display type.

Rules that never bend:
- Write like a working designer, not a marketer. Direct, concrete, specific.
- No hype, no emoji, no exclamation marks, no agency jargon, no filler adjectives.
- Never invent prices, timelines, guarantees, awards, review counts, client names, staff names, years in business, or service areas. Use only what the captured site actually says.
- When you have no fact for something, write something true and general instead of inventing one.`;

/** Tolerant JSON parse: models vary on fences, wrappers, and stray prose. */
export function parseJsonObject(raw: string): Record<string, unknown> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) throw new Error("AI returned no JSON");
  let parsed: unknown = JSON.parse(cleaned.slice(start));
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (!parsed || typeof parsed !== "object") throw new Error("AI returned no object");
  return parsed as Record<string, unknown>;
}

const str = (obj: Record<string, unknown>, key: string, fallback = ""): string => {
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const strList = (obj: Record<string, unknown>, key: string, max: number): string[] => {
  const value = obj[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, max);
};

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (obj: Record<string, unknown>, key: string, fallback: string): string => {
  const value = obj[key];
  return typeof value === "string" && HEX.test(value.trim())
    ? value.trim().toLowerCase()
    : fallback;
};

/** Clamps a model-supplied 0–1 knob. */
const unit = (obj: Record<string, unknown>, key: string, fallback: number): number => {
  const value = Number(obj[key]);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
};

/** Compact grounding summary shared by every generation call. */
function groundingBrief(capture: SiteCapture, audit: SiteAudit): string {
  return [
    `Business: ${capture.businessName ?? "unknown"}`,
    capture.title ? `Their page title: ${capture.title}` : "",
    capture.metaDescription ? `Their meta description: ${capture.metaDescription}` : "",
    capture.headings.length ? `Their headings: ${capture.headings.join(" | ")}` : "",
    capture.navLabels.length ? `Their navigation: ${capture.navLabels.join(", ")}` : "",
    capture.palette.length ? `Colours currently on the site: ${capture.palette.join(", ")}` : "",
    capture.fonts.length ? `Fonts currently on the site: ${capture.fonts.join(", ")}` : "",
    capture.phone ? `Phone on the site: ${capture.phone}` : "No phone number found on the page.",
    `Tap-to-call: ${capture.hasPhoneLink ? "yes" : "no"}. Contact form: ${
      capture.hasContactForm ? "yes" : "no"
    }. Clear call to action: ${capture.hasBookingCta ? "yes" : "no"}. Mobile viewport: ${
      capture.mobileFriendly ? "yes" : "no"
    }.`,
    capture.loadMs !== null ? `Load time: ${(capture.loadMs / 1000).toFixed(1)}s.` : "",
    `Problems found (most severe first):`,
    audit.signals
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .map((s) => `- ${s.label}: ${s.detail}`)
      .join("\n") || "- No specific issues recorded.",
    capture.excerpt ? `\nText from their homepage (verbatim, truncated):\n${capture.excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Wraps a model call so gateway refusals halt the run with a clear reason. */
async function complete(system: string, prompt: string): Promise<string> {
  const { provider, model } = resolveDraftingProvider();
  try {
    const result = streamText({ model: provider(model), system, prompt });
    return await result.text;
  } catch (error) {
    const status = statusFromAiError(error);
    if (status === 402 || status === 403) {
      throw new AiGatewayBlockedError(status, "AI generation is blocked on this account");
    }
    throw error;
  }
}

export type Direction = Pick<RedesignSpec, "brandNote" | "palette" | "typePairing" | "scene">;

/** Step 3 — brand and type direction for the rebuild. */
export async function generateDirection(
  capture: SiteCapture,
  audit: SiteAudit,
  treatment: Treatment,
): Promise<Direction> {
  const raw = await complete(
    `${VOICE}

Decide the brand and type direction for the rebuild. Stay inside the cinematic system: the ground stays near-black and the ink stays a warm off-white. You may choose an accent that suits this trade, but it must be legible on a near-black ground.

Reply with ONLY this JSON object:
{"brandNote": string (max 40 words, what the direction is and why it fits this trade),
 "ground": "#rrggbb", "ink": "#rrggbb", "accent": "#rrggbb", "gold": "#rrggbb",
 "display": string (a real, widely available typeface for headlines),
 "body": string (a real, widely available typeface for body copy),
 "mono": string (a real, widely available monospace typeface),
 "intensity": number 0-1, "refine": number 0-1, "furnace": number 0-1}
The three numbers describe the 3D ore scene: how present it is, how refined it looks, and how hot the furnace light reads. No markdown fence, no commentary.`,
    `${groundingBrief(capture, audit)}\n\nTreatment chosen: ${treatmentLabel(treatment)}.`,
  );

  const obj = parseJsonObject(raw);
  return {
    brandNote: str(
      obj,
      "brandNote",
      "Cinematic system: near-black ground, warm ink, furnace accent.",
    ).slice(0, 320),
    palette: {
      ground: hex(obj, "ground", REFINERY.ground),
      ink: hex(obj, "ink", REFINERY.ink),
      accent: hex(obj, "accent", REFINERY.accent),
      gold: hex(obj, "gold", REFINERY.gold),
    },
    typePairing: {
      display: str(obj, "display", REFINERY_TYPE.display).slice(0, 60),
      body: str(obj, "body", REFINERY_TYPE.body).slice(0, 60),
      mono: str(obj, "mono", REFINERY_TYPE.mono).slice(0, 60),
    },
    scene: {
      intensity: unit(obj, "intensity", treatment === "cinematic_3d" ? 0.9 : 0.35),
      refine: unit(obj, "refine", 0.55),
      furnace: unit(obj, "furnace", 0.6),
    },
  };
}

/** Step 4 — the hero, which is what the pitch lives or dies on. */
export async function generateHero(
  capture: SiteCapture,
  audit: SiteAudit,
  direction: Direction,
  angle: PitchAngle,
): Promise<RedesignSpec["hero"]> {
  const angleBrief = PITCH_ANGLES.find((a) => a.key === angle)?.brief ?? "";
  const raw = await complete(
    `${VOICE}

Write the hero of the rebuilt homepage. The headline must name the service and the place, not the company's history. The rotating words are single words that swap in place inside the headline's last slot, so they must all be interchangeable there.

Reply with ONLY this JSON object:
{"eyebrow": string (max 6 words, uppercase-ready),
 "headline": string (max 9 words, no full stop),
 "rotatingWords": [3 single words],
 "subhead": string (max 28 words),
 "primaryCta": string (max 4 words),
 "secondaryCta": string (max 4 words),
 "proofPoints": [3 strings, max 9 words each, each one true from the captured page or a plainly safe general statement]}
No markdown fence, no commentary.`,
    `${groundingBrief(capture, audit)}

Direction: ${direction.brandNote}
Pitch angle to support: ${angleBrief}`,
  );

  const obj = parseJsonObject(raw);
  const name = capture.businessName ?? capture.title ?? "This business";
  const rotating = strList(obj, "rotatingWords", 3);
  return {
    eyebrow: str(obj, "eyebrow", "Rebuilt homepage").slice(0, 60),
    headline: str(obj, "headline", `${name}, rebuilt`).slice(0, 120),
    rotatingWords: rotating.length >= 2 ? rotating : ["faster", "clearer", "sharper"],
    subhead: str(
      obj,
      "subhead",
      "The same business, presented so the next customer can act on it.",
    ).slice(0, 240),
    primaryCta: str(obj, "primaryCta", "Get a quote").slice(0, 40),
    secondaryCta: str(obj, "secondaryCta", "Call now").slice(0, 40),
    proofPoints: strList(obj, "proofPoints", 3),
  };
}

export interface SectionsResult {
  sections: RedesignSection[];
  footerNote: string;
  changes: RedesignChange[];
}

/** Step 5 — the rest of the page, plus the "what I changed" list for the pitch. */
export async function generateSections(
  capture: SiteCapture,
  audit: SiteAudit,
  direction: Direction,
  hero: RedesignSpec["hero"],
): Promise<SectionsResult> {
  const raw = await complete(
    `${VOICE}

Write the sections below the hero, then list what the rebuild changed. Sections must follow from what this business actually does. Use three to five sections; a quote or contact section is required.

Reply with ONLY this JSON object:
{"sections": [{"key": string (1-2 uppercase words for a thumbnail label),
               "heading": string (max 8 words),
               "body": string (max 32 words),
               "items": [up to 4 strings, max 10 words each]}],
 "footerNote": string (max 20 words),
 "changes": [3 strings, max 18 words each, each naming one concrete change and why it matters]}
No markdown fence, no commentary.`,
    `${groundingBrief(capture, audit)}

Direction: ${direction.brandNote}
Hero headline: ${hero.headline}
Hero subhead: ${hero.subhead}`,
  );

  const obj = parseJsonObject(raw);
  const rawSections = Array.isArray(obj["sections"]) ? obj["sections"] : [];
  const sections: RedesignSection[] = rawSections
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .slice(0, 5)
    .map((s) => ({
      key: (str(s, "key", "SECTION").toUpperCase() || "SECTION").slice(0, 18),
      heading: str(s, "heading", "").slice(0, 90),
      body: str(s, "body", "").slice(0, 280),
      items: strList(s, "items", 4),
    }))
    .filter((s) => s.heading);

  const changes: RedesignChange[] = strList(obj, "changes", 4).map((text, i) => ({
    index: String(i + 1).padStart(2, "0"),
    text: text.slice(0, 200),
  }));

  return {
    sections,
    footerNote: str(obj, "footerNote", "Rebuilt by The Roy Effect.").slice(0, 160),
    changes,
  };
}

/** Assembles the stored spec from the three generation stages. */
export function assembleSpec(
  direction: Direction,
  hero: RedesignSpec["hero"],
  sections: SectionsResult,
): RedesignSpec {
  return {
    brandNote: direction.brandNote,
    palette: direction.palette,
    typePairing: direction.typePairing,
    scene: direction.scene,
    hero,
    sections: sections.sections,
    footerNote: sections.footerNote,
  };
}
