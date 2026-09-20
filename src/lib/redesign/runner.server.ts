/**
 * Pipeline orchestration for the Redesign Studio.
 *
 * One step per call. The site runs on serverless hosts where a request that
 * returns cannot keep working in the background, so the admin view drives the
 * run by asking for the next step until the run is done. That also means the
 * progress on screen is the progress that actually happened — every tick is a
 * committed row.
 */

import { AiGatewayBlockedError } from "@/lib/ai-gateway.server";
import { captureSite } from "./capture.server";
import { assembleSpec, generateDirection, generateHero, generateSections } from "./design.server";
import type { Direction } from "./design.server";
import { generatePitch } from "./pitch.server";
import { PIPELINE_STEPS, STEP_COUNT } from "./types";
import type { RedesignRun, RedesignSpec } from "./types";

export const RUN_SELECT =
  "id, url, host, treatment, pitch_angle, status, step, progress, error, business_name, contact_email, capture, audit, design, changes, pitch_subject, pitch_body, pitch_rationale, pitch_status, share_token, lead_id, sent_at, completed_at, created_at";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

/** Reads a run by id, or throws if it is gone. */
export async function loadRun(id: string): Promise<RedesignRun> {
  const db = await admin();
  const { data, error } = await db
    .from("redesign_runs")
    .select(RUN_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("That run no longer exists");
  return data as RedesignRun;
}

async function patchRun(id: string, patch: Record<string, unknown>): Promise<RedesignRun> {
  const db = await admin();
  const { data, error } = await db
    .from("redesign_runs")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(RUN_SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("That run no longer exists");
  return data as RedesignRun;
}

/**
 * Commits a step's output only if the run is still on that step. Two requests
 * that race on the same run therefore do the work at most once each — the
 * loser's write is rejected and it returns the winner's row.
 */
async function commitStep(
  id: string,
  expectedStep: number,
  patch: Record<string, unknown>,
): Promise<RedesignRun> {
  const db = await admin();
  const { data, error } = await db
    .from("redesign_runs")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("step", expectedStep)
    .select(RUN_SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  // No row means another request already moved this run on.
  if (!data) return loadRun(id);
  return data as RedesignRun;
}

/**
 * Creates the CRM lead for a finished run so a drafted pitch shows up in the
 * Lead Pipeline without waiting to be sent.
 */
async function createLeadForRun(run: RedesignRun): Promise<string | null> {
  if (run.lead_id) return run.lead_id;
  const db = await admin();
  const { escapeLikePattern } = await import("@/lib/sql-like");
  const email = run.contact_email?.trim().toLowerCase() ?? null;

  if (email) {
    const { data: existing } = await db
      .from("voice_leads")
      .select("id")
      .ilike("email", escapeLikePattern(email))
      .maybeSingle();
    if (existing?.id) return existing.id as string;
  }

  const topIssue = run.audit?.signals?.[0]?.label ?? null;
  const { data: created, error } = await db
    .from("voice_leads")
    .insert({
      full_name: run.business_name ?? run.host,
      company_name: run.business_name ?? run.host,
      email,
      website_url: run.url,
      phone: run.capture?.phone ?? null,
      project_type: "website",
      primary_goal: topIssue ? `Fix: ${topIssue}` : "Redesign pitch",
      notes: `Sourced by Redesign & Pitch Studio · ${run.host} · pain score ${run.audit?.score ?? 0}`,
      consent_to_follow_up: false,
      stage: "contacted",
      source: "redesign_studio",
    })
    .select("id")
    .maybeSingle();
  if (error || !created) return null;
  return created.id as string;
}

/**
 * Runs the next pending step of a run and returns the updated row. Calling it
 * on a finished run is a no-op, so the client can poll without guarding.
 */
export async function advanceRun(id: string): Promise<RedesignRun> {
  const run = await loadRun(id);

  if (run.status === "complete" || run.status === "failed" || run.status === "cancelled") {
    return run;
  }
  if (run.step >= STEP_COUNT) {
    return patchRun(id, {
      status: "complete",
      progress: 100,
      completed_at: new Date().toISOString(),
    });
  }

  const stepDef = PIPELINE_STEPS[run.step]!;

  try {
    switch (stepDef.key) {
      case "capture": {
        const { capture, audit } = await captureSite(run.url, run.host);
        if (!capture.reachable) {
          // A site that will not load has nothing to rebuild from.
          return patchRun(id, {
            status: "failed",
            error:
              audit.signals[0]?.detail ??
              "That site could not be reached, so there is nothing to rebuild from.",
            capture,
            audit,
          });
        }
        return commitStep(id, run.step, {
          status: "running",
          step: run.step + 1,
          progress: stepDef.progress,
          capture,
          audit,
          business_name: capture.businessName,
          contact_email: capture.contactEmail,
          error: null,
        });
      }

      case "audit": {
        // The capture stage already scored the site; this step is where the
        // score is committed as the run's audit and the run is gated on it.
        if (!run.audit || run.audit.signals.length === 0) {
          return patchRun(id, {
            status: "failed",
            error: "No friction points could be identified on that page.",
          });
        }
        return commitStep(id, run.step, { step: run.step + 1, progress: stepDef.progress });
      }

      case "direction": {
        const direction = await generateDirection(run.capture!, run.audit!, run.treatment);
        return commitStep(id, run.step, {
          step: run.step + 1,
          progress: stepDef.progress,
          design: direction,
        });
      }

      case "hero": {
        const direction = run.design as unknown as Direction;
        const hero = await generateHero(run.capture!, run.audit!, direction, run.pitch_angle);
        return commitStep(id, run.step, {
          step: run.step + 1,
          progress: stepDef.progress,
          design: { ...direction, hero },
        });
      }

      case "sections": {
        const partial = run.design as unknown as Direction & { hero: RedesignSpec["hero"] };
        const sections = await generateSections(run.capture!, run.audit!, partial, partial.hero);
        return commitStep(id, run.step, {
          step: run.step + 1,
          progress: stepDef.progress,
          design: assembleSpec(partial, partial.hero, sections),
          changes: sections.changes,
        });
      }

      case "pitch": {
        const pitch = await generatePitch({
          capture: run.capture!,
          audit: run.audit!,
          changes: run.changes ?? [],
          angle: run.pitch_angle,
          host: run.host,
        });
        const leadId = await createLeadForRun(run);
        return commitStep(id, run.step, {
          step: run.step + 1,
          progress: stepDef.progress,
          status: "complete",
          completed_at: new Date().toISOString(),
          pitch_subject: pitch.subject,
          pitch_body: pitch.body,
          pitch_rationale: pitch.rationale,
          pitch_status: "draft",
          lead_id: leadId,
        });
      }
    }
  } catch (error) {
    const message =
      error instanceof AiGatewayBlockedError
        ? error.message
        : error instanceof Error
          ? error.message
          : "That step failed";
    return patchRun(id, { status: "failed", error: message });
  }

  return loadRun(id);
}
