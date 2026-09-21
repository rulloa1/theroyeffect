/** Bridges redesign runs into the voice_leads CRM pipeline. */

import { escapeLikePattern } from "@/lib/sql-like";
import type { RedesignRun } from "@/utils/redesign.functions";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

/**
 * Creates (or reuses) the CRM lead for a redesign run and links it back.
 * Returns null when the lead could not be created, so a failed CRM write never
 * blocks the pitch itself.
 */
export async function ensureLeadForRedesign(run: RedesignRun): Promise<string | null> {
  if (run.lead_id) return run.lead_id;
  const db = await admin();
  const email = run.contact_email?.trim().toLowerCase() ?? null;

  if (email) {
    const { data: existing } = await db
      .from("voice_leads")
      .select("id")
      .ilike("email", escapeLikePattern(email))
      .maybeSingle();
    if (existing?.id) {
      await db.from("redesign_runs").update({ lead_id: existing.id }).eq("id", run.id);
      return existing.id as string;
    }
  }

  const { data: created, error } = await db
    .from("voice_leads")
    .insert({
      full_name: run.host,
      company_name: run.host,
      email,
      website_url: run.url,
      project_type: "website",
      primary_goal: run.headline ? `Redesign: ${run.headline}` : "Redesign pitch",
      notes: `Sourced by Redesign & Pitch · ${run.host}`,
      consent_to_follow_up: false,
      stage: "contacted",
      source: "redesign_studio",
    })
    .select("id")
    .maybeSingle();
  if (error || !created) return null;

  await db.from("redesign_runs").update({ lead_id: created.id }).eq("id", run.id);
  return created.id as string;
}
