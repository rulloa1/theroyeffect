import { createFileRoute } from "@tanstack/react-router";
import { requireAutomationToken } from "@/lib/http/public-endpoint";

/**
 * Daily Deal Finder run: searches two niches (rotating), stores new prospects,
 * emails Rory the strongest new leads. Never contacts a business.
 */
export const Route = createFileRoute("/api/public/automation/daily-leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireAutomationToken(request);
        if (denied) return denied;
        try {
          const { runDailyLeads } = await import("@/lib/prospecting/daily-leads.server");
          return Response.json({ ok: true, ...(await runDailyLeads()) });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Daily leads failed";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
