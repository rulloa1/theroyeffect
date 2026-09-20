import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";

export type RedesignTreatment = "cinematic" | "cinematic_3d" | "editorial";
export type RedesignAngle = "lost_enquiries" | "looks_dated" | "slow_on_mobile";
export type RedesignStatus = "draft" | "pitch_sent" | "archived" | "failed";

export interface RedesignSectionDto {
  title: string;
  body: string;
}

export interface RedesignScanDto {
  reachable?: boolean;
  finalUrl?: string | null;
  statusCode?: number | null;
  loadMs?: number | null;
  https?: boolean;
  mobileFriendly?: boolean;
  title?: string | null;
  metaDescription?: string | null;
  htmlBytes?: number | null;
  hasPhoneLink?: boolean;
  hasEmailLink?: boolean;
  hasContactForm?: boolean;
  hasBookingCta?: boolean;
  copyrightYear?: number | null;
  foundEmail?: string | null;
  errorMessage?: string | null;
}

export interface RedesignRun {
  id: string;
  url: string;
  host: string;
  treatment: RedesignTreatment;
  angle: RedesignAngle;
  status: RedesignStatus;
  scan: RedesignScanDto;
  headline: string | null;
  subheadline: string | null;
  sections: RedesignSectionDto[];
  outreach_subject: string | null;
  outreach_body: string | null;
  error_message: string | null;
  created_at: string;
  /** Keys the public /redesign/<token> concept page. */
  share_token: string;
  share_viewed_at: string | null;
  contact_email: string | null;
  lead_id: string | null;
  sent_at: string | null;
}

const SELECT =
  "id, url, host, treatment, angle, status, scan, headline, subheadline, sections, outreach_subject, outreach_body, error_message, created_at, share_token, share_viewed_at, contact_email, lead_id, sent_at";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(row: any): RedesignRun {
  return {
    ...row,
    scan: (row.scan ?? {}) as RedesignScanDto,
    sections: Array.isArray(row.sections) ? (row.sections as RedesignSectionDto[]) : [],
  } as RedesignRun;
}

export const adminListRedesignRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ runs: RedesignRun[] }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { data, error } = await db
      .from("redesign_runs")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { runs: ((data as any[]) ?? []).map(normalise) };
  });

export const adminRunRedesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        url: z.string().min(3).max(300),
        treatment: z.enum(["cinematic", "cinematic_3d", "editorial"]),
        angle: z.enum(["lost_enquiries", "looks_dated", "slow_on_mobile"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ run: RedesignRun }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (context as any).userId as string;
    const { runRedesign } = await import("@/lib/redesign/redesign.server");

    try {
      const result = await runRedesign(data);
      const { data: row, error } = await db
        .from("redesign_runs")
        .insert({
          url: result.finalUrl,
          host: result.host,
          treatment: data.treatment,
          angle: data.angle,
          status: "draft",
          scan: result.scan as unknown as RedesignScanDto,
          headline: result.pitch.headline,
          subheadline: result.pitch.subheadline,
          sections: result.pitch.sections,
          outreach_subject: result.pitch.outreachSubject,
          outreach_body: result.pitch.outreachBody,
          // Seeded from the scan so a pitch is sendable without hunting for
          // the address; editable before sending.
          contact_email: result.scan.foundEmail ?? null,
          created_by: userId,
        })
        .select(SELECT)
        .single();
      if (error) throw new Error(error.message);
      return { run: normalise(row) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The redesign run failed.";
      const host =
        data.url
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0] ?? data.url;
      await db.from("redesign_runs").insert({
        url: data.url,
        host,
        treatment: data.treatment,
        angle: data.angle,
        status: "failed",
        error_message: message.slice(0, 500),
        created_by: userId,
      });
      throw new Error(message);
    }
  });

export const adminUpdateRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "pitch_sent", "archived", "failed"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { error } = await db
      .from("redesign_runs")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteRedesignRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { error } = await db.from("redesign_runs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Pitch delivery: edit the outreach, email it with a link to the concept page,
// and export the same pitch as a PDF.
// ---------------------------------------------------------------------------

/** Saves hand edits to the outreach copy and the recipient address. */
export const adminSaveRedesignOutreach = createServerFn({ method: "POST" })
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
      outreach_subject: data.subject,
      outreach_body: data.body,
      updated_at: new Date().toISOString(),
    };
    if (data.contactEmail !== undefined) patch["contact_email"] = data.contactEmail;
    const { error } = await db.from("redesign_runs").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * Emails the pitch with a button through to the concept page, then mirrors the
 * run into the CRM. Nothing leaves the studio without passing through here.
 */
export const adminSendRedesignPitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true } | { ok: false; reason: "recipient_suppressed" }> => {
      await assertAdmin(context as never);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (context as any).supabase;

      const { data: row, error: readError } = await db
        .from("redesign_runs")
        .select(SELECT)
        .eq("id", data.id)
        .maybeSingle();
      if (readError) throw new Error(readError.message);
      if (!row) throw new Error("That run no longer exists");
      const run = normalise(row);

      if (!run.contact_email) throw new Error("No email address on file for this business");
      if (!run.outreach_subject || !run.outreach_body) throw new Error("Draft the pitch first");
      if (run.sent_at) throw new Error("This pitch has already been sent");

      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const { SITE_URL } = await import("@/lib/site");

      try {
        const result = await sendTemplateEmail("redesign-pitch", run.contact_email, {
          templateData: {
            businessName: run.host,
            subject: run.outreach_subject,
            body: run.outreach_body,
            redesignUrl: `${SITE_URL}/redesign/${run.share_token}`,
          },
          idempotencyKey: `redesign-pitch-${run.id}`,
        });

        if (!result.sent) {
          await db
            .from("redesign_runs")
            .update({ error_message: `Not delivered: ${result.reason}` })
            .eq("id", run.id);
          return { ok: false as const, reason: result.reason };
        }

        await db
          .from("redesign_runs")
          .update({
            status: "pitch_sent",
            sent_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", run.id);

        // A sent pitch belongs in the pipeline; a CRM failure must not look
        // like a send failure, so this is deliberately not awaited into the
        // error path above.
        const { ensureLeadForRedesign } = await import("@/lib/redesign/crm.server");
        await ensureLeadForRedesign(run);

        return { ok: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Send failed";
        await db
          .from("redesign_runs")
          .update({ error_message: message.slice(0, 500) })
          .eq("id", run.id);
        throw new Error(message);
      }
    },
  );

/** The pitch as a PDF, for attaching or presenting. */
export const adminDownloadRedesignPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<
      { success: true; pdfBase64: string; filename: string } | { success: false; error: string }
    > => {
      await assertAdmin(context as never);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = (context as any).supabase;
        const { data: row } = await db
          .from("redesign_runs")
          .select(SELECT)
          .eq("id", data.id)
          .maybeSingle();
        if (!row) return { success: false as const, error: "That run no longer exists" };
        const run = normalise(row);

        const { buildRedesignPdf } = await import("@/lib/redesign/pdf.server");
        const { SITE_URL } = await import("@/lib/site");
        const pdfBytes = await buildRedesignPdf(run, `${SITE_URL}/redesign/${run.share_token}`);
        const safeHost = run.host.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        return {
          success: true as const,
          pdfBase64: Buffer.from(pdfBytes).toString("base64"),
          filename: `redesign-${safeHost}-${run.share_token.slice(0, 6)}.pdf`,
        };
      } catch (err) {
        console.error("adminDownloadRedesignPdf error:", err);
        return { success: false as const, error: "Could not generate PDF" };
      }
    },
  );
