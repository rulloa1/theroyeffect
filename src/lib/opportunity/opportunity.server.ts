import { generateDraftText } from "@/lib/ai-gateway.server";
import { assertPublicScanUrl, scanWebsite, type ScanResult } from "@/lib/prospecting/scan.server";
import { PRICING_TIERS } from "@/lib/commerce-catalog";

export interface OpportunityOffer {
  service: string;
  price: string;
  why: string;
}

export interface OpportunityReport {
  business: string;
  url: string | null;
  scan: ScanResult | null;
  summary: string;
  findings: string[];
  primary: OpportunityOffer;
  upsells: OpportunityOffer[];
  moneyAngle: string;
  emailSubject: string;
  emailBody: string;
  callScript: string;
  contactEmail: string | null;
}

const SYSTEM = `You are Rory Ulloa's sales strategist at The Roy Effect, a Houston studio that sells:
${PRICING_TIERS.map((t) => `- ${t.name} (${t.note} ${t.price}): ${t.description}`).join("\n")}
- AI VOICE RECEPTIONIST (from $2,500 setup): AI agent that answers calls 24/7, qualifies and books appointments.
- LEAD FOLLOW-UP AUTOMATION (from $1,500): instant SMS/email reply, CRM pipeline, automatic follow-ups.
- AI CHAT ASSISTANT (from $1,500): website chat that answers questions and captures leads.

Analyze the business and pick what Rory can realistically sell them to make money.
Rules: only state facts given in the scan or obvious from the business type; never invent metrics, revenue, reviews or percentages. Mark inferences as likely. First person singular for outreach, direct, no hype, no emoji, no exclamation marks. Email under 120 words, no signature, no URLs.

Reply ONLY with JSON:
{"summary": string (2 sentences about the business), "findings": string[] (3-6 specific gaps), "primary": {"service": string, "price": string, "why": string}, "upsells": [{"service": string, "price": string, "why": string}] (1-2), "moneyAngle": string (why this pays for itself, 2-3 sentences), "email": {"subject": string, "body": string}, "callScript": string (30-second cold call opener + one discovery question)}`;

function describe(scan: ScanResult): string[] {
  if (!scan.reachable)
    return [`Website could not be loaded: ${scan.errorMessage ?? "unknown error"}`];
  return [
    `Title: ${scan.title ?? "none"}`,
    `Meta description: ${scan.metaDescription ?? "missing"}`,
    `HTTPS: ${scan.https ? "yes" : "no"}`,
    `Mobile viewport tag: ${scan.mobileFriendly ? "yes" : "no"}`,
    `Server response time: ${scan.loadMs ?? "?"} ms`,
    `Page weight: ${scan.htmlBytes ? Math.round(scan.htmlBytes / 1024) + " KB HTML" : "unknown"}`,
    `Click-to-call phone link: ${scan.hasPhoneLink ? "yes" : "no"}`,
    `Email link: ${scan.hasEmailLink ? "yes" : "no"}`,
    `Contact form: ${scan.hasContactForm ? "yes" : "no"}`,
    `Online booking / schedule CTA: ${scan.hasBookingCta ? "yes" : "no"}`,
    `Footer copyright year: ${scan.copyrightYear ?? "not found"}`,
  ];
}

function parse(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI returned no analysis. Try again.");
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const offer = (v: unknown): OpportunityOffer => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { service: str(o["service"], "—"), price: str(o["price"], "—"), why: str(o["why"]) };
};

export async function analyzeOpportunity(input: {
  businessName?: string | undefined;
  url?: string | undefined;
}): Promise<OpportunityReport> {
  let scan: ScanResult | null = null;
  let finalUrl: string | null = null;
  if (input.url) {
    const normalised = /^https?:\/\//i.test(input.url) ? input.url : `https://${input.url}`;
    const parsed = await assertPublicScanUrl(normalised);
    scan = await scanWebsite(parsed.toString());
    finalUrl = scan.finalUrl ?? parsed.toString();
  }
  const business = input.businessName?.trim() || scan?.title || finalUrl || "Unknown business";

  const { text } = await generateDraftText({
    system: SYSTEM,
    prompt: [
      `Business name: ${input.businessName?.trim() || "not given"}`,
      `Website: ${finalUrl ?? "none given"}`,
      scan
        ? `Scan findings:\n${describe(scan)
            .map((l) => `- ${l}`)
            .join("\n")}`
        : "No website scanned — base the analysis on the business name and type only, and note that having no site may itself be the opportunity.",
    ].join("\n"),
  });

  const obj = parse(text);
  const email = (obj["email"] ?? {}) as Record<string, unknown>;
  return {
    business,
    url: finalUrl,
    scan,
    summary: str(obj["summary"]),
    findings: Array.isArray(obj["findings"])
      ? (obj["findings"] as unknown[]).map((f) => str(f)).filter(Boolean)
      : [],
    primary: offer(obj["primary"]),
    upsells: Array.isArray(obj["upsells"]) ? (obj["upsells"] as unknown[]).map(offer) : [],
    moneyAngle: str(obj["moneyAngle"]),
    emailSubject: str(email["subject"]),
    emailBody: str(email["body"]),
    callScript: str(obj["callScript"]),
    contactEmail: scan?.foundEmail ?? null,
  };
}
