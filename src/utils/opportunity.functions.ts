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
  contactPhone: string | null;
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
      contactPhone: r.contactPhone,
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
        phone: z.string().trim().max(30).nullable().optional(),
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
      if (found?.id) {
        if (data.phone)
          await db
            .from("voice_leads")
            .update({ phone: data.phone })
            .eq("id", found.id)
            .is("phone", null);
        return { leadId: found.id as string, existing: true };
      }
    }
    const { data: created, error } = await db
      .from("voice_leads")
      .insert({
        full_name: data.business,
        company_name: data.business,
        email,
        phone: data.phone || null,
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

export interface CallDue {
  leadId: string;
  business: string;
  phone: string;
  website: string | null;
  offer: string | null;
  notes: string | null;
  emailsSent: number;
}

/** Deal Finder leads with a phone number that have not been called yet. */
export const adminListCallsDue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ calls: CallDue[] }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { data: leads } = await db
      .from("voice_leads")
      .select("id, company_name, full_name, phone, website_url, primary_goal, notes")
      .eq("source", "deal_finder")
      .in("stage", ["new", "contacted"])
      .not("phone", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    const rows = (leads ?? []) as {
      id: string;
      company_name: string | null;
      full_name: string;
      phone: string;
      website_url: string | null;
      primary_goal: string | null;
      notes: string | null;
    }[];
    if (!rows.length) return { calls: [] };
    const [{ data: called }, { data: sent }] = await Promise.all([
      db
        .from("cold_calls")
        .select("phone")
        .in(
          "phone",
          rows.map((r) => r.phone),
        ),
      db
        .from("followup_drafts")
        .select("lead_id")
        .eq("status", "sent")
        .in(
          "lead_id",
          rows.map((r) => r.id),
        ),
    ]);
    const calledSet = new Set(((called ?? []) as { phone: string }[]).map((c) => c.phone));
    const sentList = ((sent ?? []) as { lead_id: string }[]).map((s) => s.lead_id);
    return {
      calls: rows
        .filter((r) => !calledSet.has(r.phone))
        .map((r) => ({
          leadId: r.id,
          business: r.company_name || r.full_name,
          phone: r.phone,
          website: r.website_url,
          offer: r.primary_goal,
          notes: r.notes,
          emailsSent: sentList.filter((id) => id === r.id).length,
        })),
    };
  });
