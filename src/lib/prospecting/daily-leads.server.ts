import { INDUSTRIES } from "./industries";
import { runProspectScan } from "./prospects.server";

/** Niches searched per daily run; rotates through the whole catalogue. */
const NICHES_PER_DAY = 2;
/** Minimum pain score for a lead to make the email. */
const MIN_SCORE = 40;
const MAX_LEADS_IN_EMAIL = 25;

export function nichesForDay(date: Date): string[] {
  const day = Math.floor(date.getTime() / 86_400_000);
  const start = (day * NICHES_PER_DAY) % INDUSTRIES.length;
  return Array.from({ length: NICHES_PER_DAY }, (_, i) => INDUSTRIES[(start + i) % INDUSTRIES.length]!.key);
}

export async function runDailyLeads(now = new Date()) {
  const keys = nichesForDay(now);
  const startedAt = new Date().toISOString();
  const summaries = [];
  for (const key of keys) {
    try {
      summaries.push(await runProspectScan(key));
    } catch (err) {
      console.error("daily leads scan failed", key, err);
    }
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { data } = await db
    .from("prospects")
    .select("business_name, industry, website, phone, contact_email, has_website, signals, pain_score")
    .gte("created_at", startedAt)
    .gte("pain_score", MIN_SCORE)
    .order("pain_score", { ascending: false })
    .limit(MAX_LEADS_IN_EMAIL);

  const label = (k: string) => INDUSTRIES.find((i) => i.key === k)?.label ?? k;
  const leads = ((data ?? []) as Record<string, unknown>[]).map((p) => {
    const signals = Array.isArray(p["signals"]) ? (p["signals"] as { label?: string }[]) : [];
    return {
      name: String(p["business_name"]),
      industry: label(String(p["industry"])),
      problem: p["has_website"] ? (signals[0]?.label ?? "Weak website") : "No website at all",
      website: (p["website"] as string) ?? null,
      phone: (p["phone"] as string) ?? null,
      email: (p["contact_email"] as string) ?? null,
    };
  });

  let emailed = false;
  if (leads.length) {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail("daily-leads", "rory@theroyeffect.com", {
      templateData: { niches: keys.map(label).join(", "), leads },
      idempotencyKey: `daily-leads-${now.toISOString().slice(0, 10)}`,
    });
    emailed = true;
  }
  return { niches: keys, summaries, leads: leads.length, emailed };
}
