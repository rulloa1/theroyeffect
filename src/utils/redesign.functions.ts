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
}

const SELECT =
  "id, url, host, treatment, angle, status, scan, headline, subheadline, sections, outreach_subject, outreach_body, error_message, created_at";

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
          created_by: userId,
        })
        .select(SELECT)
        .single();
      if (error) throw new Error(error.message);
      return { run: normalise(row) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The redesign run failed.";
      const host = data.url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] ?? data.url;
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
