import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";
import type { AdminBrief } from "@/utils/admin.functions";

/** Every brief submission, newest first. Admin only. */
export const adminListBriefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ briefs: AdminBrief[] }> => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("project_briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("adminListBriefs failed:", error.message);
      return { briefs: [] };
    }
    return { briefs: (data ?? []) as AdminBrief[] };
  });

/**
 * Return a PDF for one brief as base64.
 *
 * Older briefs were stored before the intake rendered a PDF, so this always
 * rebuilds from the saved row instead of relying on `pdf_path` existing.
 */
export const adminDownloadBriefPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; pdfBase64?: string; filename?: string; error?: string }> => {
      await assertAdmin(context as never);

      const { data: brief, error } = await context.supabase
        .from("project_briefs")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error || !brief) return { success: false, error: "Brief not found" };

      try {
        const { buildBriefPdf } = await import("@/lib/brief-pdf.server");
        const bytes = await buildBriefPdf({
          name: brief.name,
          email: brief.email,
          company: brief.company ?? "",
          projectType: brief.project_type,
          goals: brief.goals,
          audience: brief.audience ?? "",
          deliverables: brief.deliverables ?? "",
          referencesLinks: brief.references_links ?? "",
          budget: brief.budget ?? "",
          timeline: brief.timeline ?? "",
          extra: brief.extra ?? "",
          sessionId: brief.stripe_session_id ?? "",
          submittedAt: brief.created_at.slice(0, 10),
        });

        let binary = "";
        for (const byte of bytes) binary += String.fromCharCode(byte);
        const slug =
          brief.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 40) || "client";

        return {
          success: true,
          pdfBase64: btoa(binary),
          filename: `brief-${slug}.pdf`,
        };
      } catch (pdfError) {
        console.error("Brief PDF build failed:", pdfError);
        return { success: false, error: "Could not build the PDF" };
      }
    },
  );
