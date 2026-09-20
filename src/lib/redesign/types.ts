/**
 * Shared Redesign Studio types. Client-safe — no server imports, so the admin
 * view and the public redesign page can both use these.
 */

import type { ProspectSignal } from "@/lib/prospecting/industries";

export type Treatment = "cinematic" | "cinematic_3d" | "editorial";
export type PitchAngle = "lost_enquiries" | "looks_dated" | "slow_on_mobile";
export type RunStatus = "queued" | "running" | "complete" | "failed" | "cancelled" | "archived";
export type PitchStatus = "none" | "draft" | "sent" | "failed";
export type PitchTone = "shorter" | "warmer" | "more_direct" | "add_pricing";

export const TREATMENTS: { key: Treatment; label: string; shortLabel: string }[] = [
  { key: "cinematic", label: "Cinematic", shortLabel: "Cinematic" },
  { key: "cinematic_3d", label: "Cinematic + 3D", shortLabel: "+ 3D" },
  { key: "editorial", label: "Editorial", shortLabel: "Editorial" },
];

export const PITCH_ANGLES: { key: PitchAngle; label: string; brief: string }[] = [
  {
    key: "lost_enquiries",
    label: "Lost enquiries",
    brief: "Lead with the enquiries their current site is losing before anyone can contact them.",
  },
  {
    key: "looks_dated",
    label: "Looks dated",
    brief: "Lead with how dated the site looks next to the work they actually do.",
  },
  {
    key: "slow_on_mobile",
    label: "Slow on mobile",
    brief: "Lead with what happens on a phone, where most of their customers arrive.",
  },
];

/**
 * The six pipeline steps, in order. The Studio runs exactly one per request so
 * progress is real on serverless — no background workers.
 */
export const PIPELINE_STEPS = [
  { key: "capture", label: "Capture current site", progress: 15 },
  { key: "audit", label: "Audit friction points", progress: 30 },
  { key: "direction", label: "Brand & type direction", progress: 45 },
  { key: "hero", label: "Hero composition", progress: 62 },
  { key: "sections", label: "Remaining sections", progress: 82 },
  { key: "pitch", label: "Draft the pitch", progress: 100 },
] as const;

export type StepKey = (typeof PIPELINE_STEPS)[number]["key"];

export const STEP_COUNT = PIPELINE_STEPS.length;

/** The hero step's label depends on the treatment, matching the design. */
export function stepLabel(key: StepKey, treatment: Treatment): string {
  const base = PIPELINE_STEPS.find((s) => s.key === key)?.label ?? key;
  if (key !== "hero") return base;
  if (treatment === "cinematic_3d") return "Cinematic hero + 3D";
  if (treatment === "editorial") return "Editorial hero";
  return "Cinematic hero";
}

export function treatmentLabel(treatment: Treatment): string {
  return TREATMENTS.find((t) => t.key === treatment)?.label ?? treatment;
}

/** What the capture stage pulled off the live page. */
export interface SiteCapture {
  finalUrl: string | null;
  reachable: boolean;
  statusCode: number | null;
  loadMs: number | null;
  https: boolean;
  mobileFriendly: boolean;
  title: string | null;
  metaDescription: string | null;
  /** Business name inferred from the title / og:site_name / hostname. */
  businessName: string | null;
  /** First plausible contact address found in the markup. */
  contactEmail: string | null;
  phone: string | null;
  headings: string[];
  navLabels: string[];
  /** Colours found in inline styles and meta theme-color, most frequent first. */
  palette: string[];
  /** Font families named in the markup. */
  fonts: string[];
  imageCount: number;
  wordCount: number;
  hasContactForm: boolean;
  hasPhoneLink: boolean;
  hasBookingCta: boolean;
  copyrightYear: number | null;
  /** Visible body text, trimmed — the grounding for generation. */
  excerpt: string | null;
}

export interface SiteAudit {
  score: number;
  signals: ProspectSignal[];
}

export interface RedesignSection {
  /** Short uppercase label for the thumbnail rail, e.g. "SERVICES". */
  key: string;
  heading: string;
  body: string;
  items: string[];
}

/** The generated redesign. The public page renders straight from this. */
export interface RedesignSpec {
  brandNote: string;
  palette: { ground: string; ink: string; accent: string; gold: string };
  typePairing: { display: string; body: string; mono: string };
  hero: {
    eyebrow: string;
    headline: string;
    rotatingWords: string[];
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    proofPoints: string[];
  };
  sections: RedesignSection[];
  /** Scene intensity knobs for the 3D treatment, 0–1. */
  scene: { intensity: number; refine: number; furnace: number };
  footerNote: string;
}

export interface RedesignChange {
  index: string;
  text: string;
}

/** A run as the admin UI and the public page see it. */
export interface RedesignRun {
  id: string;
  url: string;
  host: string;
  treatment: Treatment;
  pitch_angle: PitchAngle;
  status: RunStatus;
  step: number;
  progress: number;
  error: string | null;
  business_name: string | null;
  contact_email: string | null;
  capture: SiteCapture | null;
  audit: SiteAudit | null;
  design: RedesignSpec | null;
  changes: RedesignChange[];
  pitch_subject: string | null;
  pitch_body: string | null;
  pitch_rationale: string | null;
  pitch_status: PitchStatus;
  share_token: string;
  lead_id: string | null;
  sent_at: string | null;
  completed_at: string | null;
  created_at: string;
}

/**
 * Normalizes what someone types into the URL field. Accepts "example.com",
 * "www.example.com/x", or a full URL; always returns an https URL unless an
 * explicit http scheme was given.
 */
export function normalizeSiteUrl(input: string): { url: string; host: string } {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a website address");
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("That is not a valid website address");
  }
  if (!parsed.hostname.includes(".")) {
    throw new Error("That is not a valid website address");
  }
  parsed.hash = "";
  return { url: parsed.toString(), host: parsed.hostname.replace(/^www\./i, "") };
}
