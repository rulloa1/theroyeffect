import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RedesignSectionDto, RedesignTreatment } from "@/utils/redesign.functions";

/** What the public /redesign/<token> page is allowed to see. */
export interface PublicRedesign {
  host: string;
  treatment: RedesignTreatment;
  headline: string;
  subheadline: string | null;
  sections: RedesignSectionDto[];
}

const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{8,64}$/i) });

/**
 * Reads a run by its share token. Runs on the service-role client, so the token
 * is the only key — nothing else about the run is exposed, and a failed or
 * archived run reads as absent.
 */
export const getPublicRedesign = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }): Promise<PublicRedesign | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;

    const { data: row } = await db
      .from("redesign_runs")
      .select("id, host, treatment, status, headline, subheadline, sections")
      .eq("share_token", data.token)
      .maybeSingle();

    // Only a drafted or already-sent pitch has a page worth showing.
    if (!row || (row.status !== "draft" && row.status !== "pitch_sent")) return null;
    if (!row.headline) return null;

    await db
      .from("redesign_runs")
      .update({ share_viewed_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("share_viewed_at", null);

    return {
      host: row.host as string,
      treatment: row.treatment as RedesignTreatment,
      headline: row.headline as string,
      subheadline: (row.subheadline as string) ?? null,
      sections: Array.isArray(row.sections) ? (row.sections as RedesignSectionDto[]) : [],
    };
  });

const runSchema = z.object({
  url: z.string().min(3).max(300),
  treatment: z.enum(["cinematic", "cinematic_3d", "editorial"]),
  angle: z.enum(["lost_enquiries", "looks_dated", "slow_on_mobile"]),
  // Honeypot: real visitors never fill this; bots that do are turned away.
  company: z.string().max(0).optional(),
  // Where the approved pitch should go; falls back to an address found on the site.
  email: z.string().trim().email().max(200).optional(),
});

/**
 * Public entry to the redesign generator: scans the submitted site, drafts the
 * pitch, stores the run and returns its share token so the visitor lands on
 * their concept page. Runs on the service-role client; the only write is the
 * run row itself.
 */
export const runPublicRedesign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => runSchema.parse(input))
  .handler(async ({ data }): Promise<{ token: string }> => {
    if (data.company) throw new Error("That submission did not look human.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runRedesign } = await import("@/lib/redesign/redesign.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;

    const result = await runRedesign(data);
    const { data: row, error } = await db
      .from("redesign_runs")
      .insert({
        url: result.finalUrl,
        host: result.host,
        treatment: data.treatment,
        angle: data.angle,
        status: "draft",
        scan: result.scan,
        headline: result.pitch.headline,
        subheadline: result.pitch.subheadline,
        sections: result.pitch.sections,
        outreach_subject: result.pitch.outreachSubject,
        outreach_body: result.pitch.outreachBody,
        contact_email: data.email ?? result.scan.foundEmail ?? null,
      })
      .select("id, share_token")
      .single();
    if (error) throw new Error(error.message);

    // Nothing goes to the visitor yet: Rory reviews the draft in the portal
    // and sends it from the Redesign tab. A notify failure never blocks the run.
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("brief-notification", "rory@theroyeffect.com", {
        templateData: {
          name: `Redesign pitch: ${result.host}`,
          email: data.email ?? result.scan.foundEmail ?? undefined,
          websiteUrl: result.finalUrl,
          projectType: "Redesign pitch awaiting approval",
          message: `A new redesign pitch for ${result.host} is waiting in your portal. Review it, then send it from Admin > Redesign: https://theroyeffect.com/admin`,
          notes: `Subject: ${result.pitch.outreachSubject}`,
          submittedAt: new Date().toISOString(),
        },
        idempotencyKey: `redesign-approval-${row.id}`,
        ...(data.email ? { replyTo: data.email } : {}),
      });
    } catch (notifyError) {
      console.error("redesign approval notify failed", notifyError);
    }
    return { token: row.share_token as string };
  });
