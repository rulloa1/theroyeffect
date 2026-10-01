import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";

export interface OpportunityOfferDto {
  service: string;
  price: string;
  why: string;
}

export interface OpportunityReportDto {
  business: string;
  url: string | null;
  summary: string;
  findings: string[];
  primary: OpportunityOfferDto;
  upsells: OpportunityOfferDto[];
  moneyAngle: string;
  emailSubject: string;
  emailBody: string;
  callScript: string;
  contactEmail: string | null;
  scanOk: boolean | null;
}

export const adminAnalyzeOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        businessName: z.string().trim().max(200).optional(),
        url: z.string().trim().max(300).optional(),
      })
      .refine((v) => !!v.businessName || !!v.url, "Enter a business name or website")
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<OpportunityReportDto> => {
    await assertAdmin(context as never);
    const { analyzeOpportunity } = await import("@/lib/opportunity/opportunity.server");
    const r = await analyzeOpportunity({
      businessName: data.businessName || undefined,
      url: data.url || undefined,
    });
    return {
      business: r.business,
      url: r.url,
      summary: r.summary,
      findings: r.findings,
      primary: r.primary,
      upsells: r.upsells,
      moneyAngle: r.moneyAngle,
      emailSubject: r.emailSubject,
      emailBody: r.emailBody,
      callScript: r.callScript,
      contactEmail: r.contactEmail,
      scanOk: r.scan ? r.scan.reachable : null,
    };
  });

/** Saves an analyzed business as a lead in the CRM pipeline (reuses an existing lead by email). */
export const adminSaveOpportunityLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        business: z.string().trim().min(1).max(200),
        url: z.string().trim().max(300).nullable(),
        email: z.string().trim().email().nullable(),
        offer: z.string().trim().max(300),
        notes: z.string().max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ leadId: string; existing: boolean }> => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { escapeLikePattern } = await import("@/lib/sql-like");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const email = data.email?.toLowerCase() ?? null;
    if (email) {
      const { data: found } = await db
        .from("voice_leads")
        .select("id")
        .ilike("email", escapeLikePattern(email))
        .maybeSingle();
      if (found?.id) return { leadId: found.id as string, existing: true };
    }
    const { data: created, error } = await db
      .from("voice_leads")
      .insert({
        full_name: data.business,
        company_name: data.business,
        email,
        website_url: data.url,
        project_type: "website",
        primary_goal: `Opportunity: ${data.offer}`,
        notes: data.notes,
        consent_to_follow_up: false,
        stage: "new",
        source: "deal_finder",
      })
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Could not save the lead");
    return { leadId: created.id as string, existing: false };
  });
