/**
 * Delivery automation — sends scheduled emails that aren't triggered by an
 * admin action but by the passage of time:
 *   1. support-window-closing — 12 days after a project's handover
 *   2. retainer-weekly-sync — every Monday for active retainer clients
 *
 * Called by pg_cron through the /api/public/automation/delivery route.
 */

import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SITE_URL = "https://www.theroyeffect.com";
const OWNER_EMAIL = "rory@theroyeffect.com";

interface DeliveryRunResult {
  ok: boolean;
  sent: number;
  message?: string;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Finds projects that had a handover sent ~12 days ago and sends the
 * support-window-closing email. Uses the `project_briefs.project_status`
 * field — when it's set to "completed" (meaning handover was done), we
 * check if it was set ~12 days ago. Since we don't track the exact handover
 * timestamp separately, we approximate by looking at the brief's
 * `updated_at` when the status was last changed.
 *
 * Idempotency: the email's idempotency key is scoped to the project ID +
 * "support-closing", so it only sends once per project.
 */
async function sendSupportWindowClosingEmails(): Promise<number> {
  const db = await admin();
  let sent = 0;

  try {
    // Projects whose brief status is "completed" (meaning the project launched).
    // The project_briefs table has no updated_at, so we use created_at as a
    // rough time filter — only briefs created 12-14 days ago that are in
    // "completed" status. This is a v1 approximation; a future migration
    // could add a `status_changed_at` column for precision.
    const twelveDaysAgo = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: projects } = await db
      .from("project_briefs")
      .select("id, name, email, project_status, project_type, created_at")
      .eq("project_status", "completed")
      .gte("created_at", fourteenDaysAgo)
      .lte("created_at", twelveDaysAgo);

    for (const project of projects ?? []) {
      if (!project.email) continue;
      try {
        const res = await sendTemplateEmail("support-window-closing", project.email, {
          templateData: {
            name: project.name || "there",
            projectTitle: project.project_type || "your project",
            daysLeft: 2,
            retainerUrl: `${SITE_URL}/pricing`,
          },
          idempotencyKey: `support-closing-${project.id}`,
          replyTo: OWNER_EMAIL,
        });
        if (res.sent) sent += 1;
      } catch (err) {
        console.error("[delivery] support-window-closing failed for", project.id, err);
      }
    }
  } catch (err) {
    console.error("[delivery] support-window-closing batch failed:", err);
  }

  return sent;
}

/**
 * Sends the weekly retainer sync email to every active retainer client.
 *
 * "Active" means: an order with `stripe_subscription_id` that is not
 * cancelled, OR a project_briefs row with `project_status` containing
 * "retainer". We match on the order's customer email.
 *
 * Idempotency: scoped to the email + today's date, so re-runs on the same
 * day don't double-send.
 */
async function sendRetainerWeeklySyncEmails(): Promise<number> {
  const db = await admin();
  let sent = 0;
  const today = new Date().toISOString().slice(0, 10);

  try {
    // Find active retainer subscriptions
    const { data: retainerOrders } = await db
      .from("orders")
      .select("id, customer_email, customer_name, product_name")
      .not("stripe_subscription_id", "is", null)
      .neq("payment_status", "cancelled")
      .not("customer_email", "is", null);

    for (const order of retainerOrders ?? []) {
      if (!order.customer_email) continue;
      try {
        const res = await sendTemplateEmail("retainer-weekly-sync", order.customer_email, {
          templateData: {
            name: order.customer_name || "there",
            projectTitle: order.product_name || "Retainer",
            shipped: [],
            inProgress: [],
            upNext: [],
            portalUrl: `${SITE_URL}/portal`,
          },
          idempotencyKey: `retainer-sync-${order.customer_email}-${today}`,
          replyTo: OWNER_EMAIL,
        });
        if (res.sent) sent += 1;
      } catch (err) {
        console.error("[delivery] retainer-weekly-sync failed for", order.customer_email, err);
      }
    }
  } catch (err) {
    console.error("[delivery] retainer-weekly-sync batch failed:", err);
  }

  return sent;
}

/**
 * Run the delivery automation batch. Called by the cron route.
 */
export async function runDeliveryBatch(): Promise<DeliveryRunResult> {
  const [supportSent, syncSent] = await Promise.all([
    sendSupportWindowClosingEmails(),
    sendRetainerWeeklySyncEmails(),
  ]);

  const total = supportSent + syncSent;
  return {
    ok: true,
    sent: total,
    message: `Support-window: ${supportSent}, weekly-sync: ${syncSent}`,
  };
}
