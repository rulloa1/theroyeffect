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
