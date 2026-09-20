import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";
import { normalizeSiteUrl } from "@/lib/redesign/types";
import type { RedesignRun } from "@/lib/redesign/types";

export type {
  PitchAngle,
  PitchTone,
  RedesignChange,
  RedesignRun,
  RedesignSection,
  RedesignSpec,
  RunStatus,
  SiteAudit,
  SiteCapture,
  Treatment,
} from "@/lib/redesign/types";

const RUN_SELECT =
  "id, url, host, treatment, pitch_angle, status, step, progress, error, business_name, contact_email, capture, audit, design, changes, pitch_subject, pitch_body, pitch_rationale, pitch_status, share_token, lead_id, sent_at, completed_at, created_at";

const idSchema = z.object({ id: z.string().uuid() });

export const adminListRedesignRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ runs: RedesignRun[] }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { data, error } = await db
      .from("redesign_runs")
      .select(RUN_SELECT)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { runs: (data as RedesignRun[]) ?? [] };
  });

export const adminGetRedesignRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<RedesignRun> => {
    await assertAdmin(context as never);
    const { loadRun } = await import("@/lib/redesign/runner.server");
    return loadRun(data.id);
  });

/**
 * Queues a run. The pipeline itself is driven by repeated
 * {@link adminAdvanceRedesignRun} calls, so this returns as soon as the row
 * exists and the UI can show the running state immediately.
 */
export const adminStartRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        url: z.string().min(3).max(300),
        treatment: z.enum(["cinematic", "cinematic_3d", "editorial"]),
        pitchAngle: z.enum(["lost_enquiries", "looks_dated", "slow_on_mobile"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<RedesignRun> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;

    // Throws a client-safe message on anything that is not a website address.
    const { url, host } = normalizeSiteUrl(data.url);

    // Reject a target the scanner would refuse before a row is written, so the
    // studio never shows a run that cannot start.
    const { assertPublicScanUrl } = await import("@/lib/prospecting/scan.server");
    await assertPublicScanUrl(url);

    const { data: created, error } = await db
      .from("redesign_runs")
      .insert({
        url,
        host,
        treatment: data.treatment,
        pitch_angle: data.pitchAngle,
        status: "running",
      })
      .select(RUN_SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!created) throw new Error("Could not start that run");
    return created as RedesignRun;
  });

/** Runs the next pipeline step and returns the updated run. */
export const adminAdvanceRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<RedesignRun> => {
    await assertAdmin(context as never);
    const { advanceRun } = await import("@/lib/redesign/runner.server");
    return advanceRun(data.id);
  });

export const adminCancelRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { error } = await db
      .from("redesign_runs")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .in("status", ["queued", "running"]);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminArchiveRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { error } = await db
      .from("redesign_runs")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Re-runs a failed or finished run from the start, keeping the same row. */
export const adminRerunRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<RedesignRun> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { data: updated, error } = await db
      .from("redesign_runs")
      .update({
        status: "running",
        step: 0,
        progress: 0,
        error: null,
        capture: {},
        audit: {},
        design: {},
        changes: [],
        pitch_subject: null,
        pitch_body: null,
        pitch_rationale: null,
        pitch_status: "none",
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      // A pitch that already went out is history — never overwrite it.
      .is("sent_at", null)
      .select(RUN_SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("That run has already been sent, so it cannot be re-run");
    return updated as RedesignRun;
  });

/** Regenerates the pitch, optionally nudged by one of the tone controls. */
export const adminRegenerateRedesignPitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        tone: z.enum(["shorter", "warmer", "more_direct", "add_pricing"]).nullish(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<RedesignRun> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { loadRun } = await import("@/lib/redesign/runner.server");
    const run = await loadRun(data.id);
    if (!run.capture || !run.audit) throw new Error("This run has nothing to draft from yet");

    const { generatePitch } = await import("@/lib/redesign/pitch.server");
    const pitch = await generatePitch({
      capture: run.capture,
      audit: run.audit,
      changes: run.changes ?? [],
      angle: run.pitch_angle,
      host: run.host,
      previous:
        run.pitch_subject && run.pitch_body
          ? { subject: run.pitch_subject, body: run.pitch_body }
          : null,
      tone: data.tone ?? null,
    });

    const { data: updated, error } = await db
      .from("redesign_runs")
      .update({
        pitch_subject: pitch.subject,
        pitch_body: pitch.body,
        pitch_rationale: pitch.rationale,
        pitch_status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select(RUN_SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("That run no longer exists");
    return updated as RedesignRun;
  });

/** Saves hand edits to the pitch, and the recipient address. */
export const adminSaveRedesignPitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        subject: z.string().min(1).max(200),
        body: z.string().min(1).max(6000),
        contactEmail: z.string().email().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const patch: Record<string, unknown> = {
      pitch_subject: data.subject,
      pitch_body: data.body,
      pitch_status: "draft",
      updated_at: new Date().toISOString(),
    };
    if (data.contactEmail !== undefined) patch["contact_email"] = data.contactEmail;
    const { error } = await db.from("redesign_runs").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Sends the pitch. Nothing leaves the studio without passing through here. */
export const adminSendRedesignPitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true } | { ok: false; reason: "recipient_suppressed" }> => {
      await assertAdmin(context as never);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (context as any).supabase;
      const { loadRun } = await import("@/lib/redesign/runner.server");
      const run = await loadRun(data.id);

      if (!run.contact_email) throw new Error("No email address on file for this business");
      if (!run.pitch_subject || !run.pitch_body) throw new Error("Draft the pitch first");
      if (run.sent_at) throw new Error("This pitch has already been sent");

      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const { SITE_URL } = await import("@/lib/site");

      try {
        const result = await sendTemplateEmail("redesign-pitch", run.contact_email, {
          templateData: {
            businessName: run.business_name ?? run.host,
            subject: run.pitch_subject,
            body: run.pitch_body,
            redesignUrl: `${SITE_URL}/redesign/${run.share_token}`,
            topIssue: run.audit?.signals?.[0]?.label ?? null,
          },
          idempotencyKey: `redesign-pitch-${run.id}`,
        });

        if (!result.sent) {
          await db
            .from("redesign_runs")
            .update({ pitch_status: "failed", error: `Not delivered: ${result.reason}` })
            .eq("id", run.id);
          return { ok: false as const, reason: result.reason };
        }

        await db
          .from("redesign_runs")
          .update({
            pitch_status: "sent",
            sent_at: new Date().toISOString(),
            error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", run.id);

        // Move the lead on now that the pitch is actually out.
        if (run.lead_id) {
          const { syncLeadStage } = await import("@/lib/prospecting/crm.server");
          await syncLeadStage(run.lead_id, "contacted");
        }

        return { ok: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Send failed";
        await db
          .from("redesign_runs")
          .update({ pitch_status: "failed", error: message })
          .eq("id", run.id);
        throw new Error(message);
      }
    },
  );

/** The audit notes PDF that ships with the pitch. */
export const adminDownloadRedesignPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<
      { success: true; pdfBase64: string; filename: string } | { success: false; error: string }
    > => {
      await assertAdmin(context as never);
      try {
        const { loadRun } = await import("@/lib/redesign/runner.server");
        const { buildRedesignAuditPdf } = await import("@/lib/redesign/pdf.server");
        const { SITE_URL } = await import("@/lib/site");
        const run = await loadRun(data.id);
        const pdfBytes = await buildRedesignAuditPdf(
          run,
          `${SITE_URL}/redesign/${run.share_token}`,
        );
        const safeHost = run.host.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        return {
          success: true as const,
          pdfBase64: Buffer.from(pdfBytes).toString("base64"),
          filename: `audit-${safeHost}-${run.share_token.slice(0, 6)}.pdf`,
        };
      } catch (err) {
        console.error("adminDownloadRedesignPdf error:", err);
        return { success: false as const, error: "Could not generate PDF" };
      }
    },
  );
