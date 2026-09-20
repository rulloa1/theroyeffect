import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RedesignChange, RedesignSpec, Treatment } from "@/lib/redesign/types";

/** What the public /redesign/<token> page is allowed to see. */
export interface PublicRedesign {
  businessName: string;
  host: string;
  treatment: Treatment;
  design: RedesignSpec;
  changes: RedesignChange[];
}

const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{8,64}$/i) });

/**
 * Reads a finished run by its share token. Runs the service-role client, so the
 * token is the only key — nothing else about the run is exposed, and an
 * unfinished, cancelled or archived run reads as absent.
 */
export const getPublicRedesign = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }): Promise<PublicRedesign | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;

    const { data: row } = await db
      .from("redesign_runs")
      .select("id, host, business_name, treatment, status, design, changes")
      .eq("share_token", data.token)
      .maybeSingle();
    if (!row || row.status !== "complete") return null;

    const design = row.design as RedesignSpec | null;
    if (!design?.hero?.headline) return null;

    await db
      .from("redesign_runs")
      .update({ share_viewed_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("share_viewed_at", null);

    return {
      businessName: (row.business_name as string) ?? (row.host as string),
      host: row.host as string,
      treatment: row.treatment as Treatment,
      design,
      changes: ((row.changes as RedesignChange[]) ?? []).slice(0, 4),
    };
  });
