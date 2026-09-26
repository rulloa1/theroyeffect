import {
  AiGatewayBlockedError,
  generateDraftText,
  statusFromAiError,
} from "@/lib/ai-gateway.server";
import { scanWebsite, type ScanResult } from "@/lib/prospecting/scan.server";

export type Treatment = "cinematic" | "cinematic_3d" | "editorial";
export type Angle = "lost_enquiries" | "looks_dated" | "slow_on_mobile";

export const TREATMENT_LABEL: Record<Treatment, string> = {
  cinematic: "CINEMATIC",
  cinematic_3d: "CINEMATIC + 3D",
  editorial: "EDITORIAL",
};

export const ANGLE_LABEL: Record<Angle, string> = {
  lost_enquiries: "LOST ENQUIRIES",
  looks_dated: "LOOKS DATED",
  slow_on_mobile: "SLOW ON MOBILE",
};

const TREATMENT_BRIEF: Record<Treatment, string> = {
  cinematic:
    "Cinematic: near-black ground, one accent red, large condensed display type, scroll-driven reveals, generous whitespace, photography treated full-bleed.",
  cinematic_3d:
    "Cinematic + 3D: the cinematic system plus one restrained 3D hero object that reacts to scroll, with a static fallback on mobile and reduced-motion.",
  editorial:
    "Editorial: warm paper ground, strong typographic hierarchy, wide measure, rules and captions, images used sparingly and deliberately.",
};

const ANGLE_BRIEF: Record<Angle, string> = {
  lost_enquiries:
    "Lead on enquiries the current site is losing: unclear next step, buried or broken contact paths, no obvious reason to call.",
  looks_dated:
    "Lead on the site looking dated next to the quality of the actual work: old layout conventions, stock imagery, inconsistent brand.",
  slow_on_mobile:
    "Lead on the mobile experience: slow or heavy pages, tiny tap targets, the primary action hidden below the fold on a phone.",
};

export interface RedesignSection {
  title: string;
  body: string;
}

export interface RedesignPitch {
  headline: string;
  subheadline: string;
  sections: RedesignSection[];
  outreachSubject: string;
  outreachBody: string;
}

const SYSTEM = `You are Rory Ulloa, a Houston-based creative director and no-code developer at The Roy Effect. You are preparing a redesign pitch for a small business whose current website has just been scanned.

Voice: first person singular, direct, specific, no hype, no emoji, no exclamation marks, no agency jargon, no flattery.
Rules:
- Only use facts given in the scan. Never invent metrics, percentages, prices, timelines, guarantees, client names or testimonials.
- If something was not measured, do not claim it.
- The pitch describes what I would change and why, not a finished result.
- The outreach email is under 120 words, no greeting sign-off block, no signature, no subject line inside the body, no URLs.

Reply with ONLY a JSON object:
{"headline": string, "subheadline": string, "sections": [{"title": string, "body": string}], "outreach": {"subject": string, "body": string}}
headline: under 60 characters, the redesign's single idea, uppercase-friendly.
subheadline: one sentence, under 200 characters.
sections: exactly 4 items — "WHAT I FOUND", "THE IDEA", "THE NEW HOMEPAGE", "WHAT CHANGES FIRST". Each body 40-80 words.
outreach.subject: under 55 characters, plain and specific.
No markdown fence, no commentary.`;

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Tolerant parse: models vary on fences, key names and array wrappers. */
export function parseRedesignResponse(raw: string): RedesignPitch {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) throw new Error("AI returned no JSON");
  let parsed: unknown = JSON.parse(cleaned.slice(start));
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (!parsed || typeof parsed !== "object") throw new Error("AI returned no pitch object");
  const obj = parsed as Record<string, unknown>;

  const rawSections = Array.isArray(obj["sections"]) ? (obj["sections"] as unknown[]) : [];
  const sections: RedesignSection[] = rawSections
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: pick(item, ["title", "heading", "label"]).slice(0, 80),
      body: pick(item, ["body", "text", "content"]).slice(0, 1200),
    }))
    .filter((item) => item.title && item.body);

  const outreachRaw = (obj["outreach"] ?? {}) as Record<string, unknown>;
  const headline = pick(obj, ["headline", "title"]);
  const outreachSubject = pick(outreachRaw, ["subject", "subjectLine", "subject_line"]);
  const outreachBody = pick(outreachRaw, ["body", "email_body", "message"]);
  if (!headline || !sections.length || !outreachSubject || !outreachBody) {
    throw new Error("AI pitch was incomplete");
  }

  return {
    headline: headline.slice(0, 120),
    subheadline: pick(obj, ["subheadline", "subhead", "summary"]).slice(0, 300),
    sections,
    outreachSubject: outreachSubject.slice(0, 140),
    outreachBody: outreachBody.slice(0, 4000),
  };
}

/** Human-readable problem list derived from the scan, used as the prompt evidence. */
export function describeScan(scan: ScanResult): string[] {
  const notes: string[] = [];
  if (!scan.reachable)
    notes.push(`The site did not load cleanly: ${scan.errorMessage ?? "unknown"}`);
  if (scan.title) notes.push(`Page title: "${scan.title}"`);
  else notes.push("The homepage has no page title.");
  if (scan.metaDescription) notes.push(`Meta description: "${scan.metaDescription}"`);
  else notes.push("The homepage has no meta description.");
  if (!scan.https) notes.push("The site is not served over HTTPS.");
  if (!scan.mobileFriendly)
    notes.push("There is no mobile viewport tag, so the layout is not built for phones.");
  if (scan.loadMs !== null) notes.push(`The homepage responded in ${scan.loadMs}ms.`);
  if (scan.htmlBytes !== null)
    notes.push(`Homepage HTML weighs ${Math.round(scan.htmlBytes / 1024)}KB.`);
  notes.push(scan.hasPhoneLink ? "There is a tap-to-call link." : "There is no tap-to-call link.");
  notes.push(scan.hasContactForm ? "There is a contact form." : "There is no contact form.");
  notes.push(
    scan.hasBookingCta
      ? "There is some kind of quote or booking wording."
      : "There is no quote or booking call to action.",
  );
  if (scan.copyrightYear) notes.push(`The footer copyright reads ${scan.copyrightYear}.`);
  return notes;
}

export async function generateRedesignPitch(input: {
  host: string;
  finalUrl: string;
  treatment: Treatment;
  angle: Angle;
  scan: ScanResult;
}): Promise<RedesignPitch> {
  try {
    const { text } = await generateDraftText({
      system: SYSTEM,
      prompt: [
        `Prospect website: ${input.finalUrl} (${input.host})`,
        `Design treatment I would use — ${TREATMENT_BRIEF[input.treatment]}`,
        `Pitch angle — ${ANGLE_BRIEF[input.angle]}`,
        "Scan findings (the only facts you may use):",
        describeScan(input.scan)
          .map((line) => `- ${line}`)
          .join("\n"),
      ].join("\n"),
    });
    return parseRedesignResponse(text);
  } catch (error) {
    const status = statusFromAiError(error);
    if (status === 402 || status === 403) {
      throw new AiGatewayBlockedError(status, "AI drafting is blocked");
    }
    throw error;
  }
}

export interface RedesignRunResult {
  host: string;
  finalUrl: string;
  scan: ScanResult;
  pitch: RedesignPitch;
}

/** Scans a prospect website and drafts the redesign pitch plus outreach for it. */
export async function runRedesign(input: {
  url: string;
  treatment: Treatment;
  angle: Angle;
}): Promise<RedesignRunResult> {
  const normalised = /^https?:\/\//i.test(input.url) ? input.url : `https://${input.url}`;
  const { assertPublicScanUrl } = await import("@/lib/prospecting/scan.server");
  const parsed = await assertPublicScanUrl(normalised);
  const scan = await scanWebsite(parsed.toString());
  if (!scan.reachable && !scan.title) {
    throw new Error(scan.errorMessage ?? "That website could not be reached.");
  }
  const finalUrl = scan.finalUrl ?? parsed.toString();
  const pitch = await generateRedesignPitch({
    host: parsed.hostname.replace(/^www\./i, ""),
    finalUrl,
    treatment: input.treatment,
    angle: input.angle,
    scan,
  });
  return { host: parsed.hostname.replace(/^www\./i, ""), finalUrl, scan, pitch };
}
