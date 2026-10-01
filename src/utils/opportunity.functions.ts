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
