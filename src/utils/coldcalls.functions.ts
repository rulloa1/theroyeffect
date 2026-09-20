import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";

export interface ColdCall {
  id: string;
  business_name: string;
  phone: string;
  website: string | null;
  redesign_run_id: string | null;
  vapi_call_id: string | null;
  status: string;
  talking_points: string | null;
  error_message: string | null;
  created_at: string;
  /** Joined from the voice call record once the agent reports back. */
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  ended_reason: string | null;
}

const SELECT =
  "id, business_name, phone, website, redesign_run_id, vapi_call_id, status, talking_points, error_message, created_at";

export const adminListColdCalls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ calls: ColdCall[] }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { data, error } = await db
      .from("cold_calls")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = ((data as any[]) ?? []).map((row) => ({
      ...row,
      summary: null,
      transcript: null,
      recording_url: null,
      ended_reason: null,
    })) as ColdCall[];

    const ids = rows.map((row) => row.vapi_call_id).filter((id): id is string => !!id);
    if (ids.length) {
      const { data: records } = await db
        .from("voice_call_records")
        .select("vapi_call_id, summary, transcript, recording_url, ended_reason, status")
        .in("vapi_call_id", ids);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const record of ((records as any[]) ?? [])) {
        const row = rows.find((item) => item.vapi_call_id === record.vapi_call_id);
        if (!row) continue;
        row.summary = record.summary ?? null;
        row.transcript = record.transcript ?? null;
        row.recording_url = record.recording_url ?? null;
        row.ended_reason = record.ended_reason ?? null;
        if (record.status) row.status = record.status as string;
      }
    }
    return { calls: rows };
  });

export const adminStartColdCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        businessName: z.string().trim().min(1).max(160),
        phone: z.string().trim().min(7).max(30),
        website: z.string().trim().max(300).optional().nullable(),
        talkingPoints: z.string().trim().max(2000).optional().nullable(),
        redesignRunId: z.string().uuid().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ callId: string }> => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (context as any).userId as string;
    const { placeColdCall, normalisePhone } = await import("@/lib/vapi/outbound.server");

    const base = {
      business_name: data.businessName,
      phone: data.phone,
      website: data.website ?? null,
      talking_points: data.talkingPoints ?? null,
      redesign_run_id: data.redesignRunId ?? null,
      created_by: userId,
    };

    try {
      const phone = normalisePhone(data.phone);
      const result = await placeColdCall({
        businessName: data.businessName,
        phone,
        website: data.website ?? null,
        talkingPoints: data.talkingPoints ?? null,
      });
      const { error } = await db
        .from("cold_calls")
        .insert({ ...base, phone, vapi_call_id: result.callId, status: result.status });
      if (error) throw new Error(error.message);
      return { callId: result.callId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The call could not be placed.";
      await db
        .from("cold_calls")
        .insert({ ...base, status: "failed", error_message: message.slice(0, 500) });
      throw new Error(message);
    }
  });

export const adminDeleteColdCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context as any).supabase;
    const { error } = await db.from("cold_calls").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
