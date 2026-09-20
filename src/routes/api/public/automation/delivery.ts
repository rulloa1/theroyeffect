import { createFileRoute } from "@tanstack/react-router";
import { requireAutomationToken, json } from "@/lib/http/public-endpoint";

/**
 * Scheduled entry point for the delivery automation.
 * Called by pg_cron with the shared automation token.
 *
 * Sends:
 *   - support-window-closing emails (day 12 of the 14-day support window)
 *   - retainer-weekly-sync emails (every Monday for active retainers)
 */
export const Route = createFileRoute("/api/public/automation/delivery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireAutomationToken(request);
        if (denied) return denied;

        try {
          const { runDeliveryBatch } = await import("@/lib/automation/delivery.server");
          const result = await runDeliveryBatch();
          return Response.json(result, { status: result.ok ? 200 : 500 });
        } catch (error) {
          console.error("[delivery] cron route failed:", error);
          return json({ ok: false, sent: 0, error: "Delivery batch failed" }, 500);
        }
      },
    },
  },
});
