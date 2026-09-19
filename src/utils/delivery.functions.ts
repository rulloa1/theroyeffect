import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/utils/require-admin";

const SITE_URL = "https://www.theroyeffect.com";

/**
 * Delivery server functions — wire the SOPs in docs/delivery-playbook.md
 * to the admin dashboard. Each function performs a delivery action and
 * sends the corresponding email template to the lead/client.
 */

/* ------------------------------------------------------------------ */
/* 1. AUDIT DELIVERED                                                  */
/* ------------------------------------------------------------------ */

const auditDeliveredSchema = z.object({
  inquiryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  domain: z.string().min(3).max(255),
  fix1: z.string().min(3).max(300),
  fix2: z.string().min(3).max(300),
  fix3: z.string().min(3).max(300),
  videoUrl: z.string().url().max(500),
});

export const deliverAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof auditDeliveredSchema>) => auditDeliveredSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      // Mark the inquiry as replied
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("contact_inquiries")
        .update({ status: "replied" })
        .eq("id", data.inquiryId);

      // Update the lead stage to "contacted" if a matching lead exists
      try {
        await supabaseAdmin
          .from("voice_leads")
          .update({ stage: "contacted" })
          .ilike("email", data.email)
          .eq("stage", "new");
      } catch {
        // Non-fatal — lead may not exist
      }

      // Update the audit request status if one exists
      try {
        await supabaseAdmin
          .from("voice_audit_requests")
          .update({ status: "audit_delivered" })
          .ilike("email", data.email);
      } catch {
        // Non-fatal
      }

      // Send the audit-delivered email
      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("audit-delivered", data.email, {
          templateData: {
            name: data.name,
            domain: data.domain,
            fix1: data.fix1,
            fix2: data.fix2,
            fix3: data.fix3,
            videoUrl: data.videoUrl,
            bookUrl: `${SITE_URL}/book`,
          },
          idempotencyKey: `audit-delivered-${data.inquiryId}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("deliverAudit email error:", err);
        return { success: false, error: "Audit marked delivered but email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 2. DISCOVERY CALL RECAP                                             */
/* ------------------------------------------------------------------ */

const discoveryRecapSchema = z.object({
  bookingId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  businessName: z.string().max(200).optional(),
  summary: z.string().min(10).max(2000),
  recommendedTier: z.string().min(1).max(200),
  whyFit: z.string().max(500).optional(),
  timeline: z.string().max(200).optional(),
  investment: z.string().max(100).optional(),
  deposit: z.string().max(100).optional(),
  includes: z.array(z.string().max(300)).max(10).optional(),
  proposalId: z.string().uuid().optional(),
});

export const sendDiscoveryRecap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof discoveryRecapSchema>) => discoveryRecapSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      // Mark the booking as completed
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("voice_bookings")
        .update({ status: "completed" })
        .eq("id", data.bookingId);

      // Move the lead to "proposal_sent" if they exist
      try {
        await supabaseAdmin
          .from("voice_leads")
          .update({ stage: "proposal_sent" })
          .ilike("email", data.email)
          .in("stage", ["contacted", "discovery_scheduled"]);
      } catch {
        // Non-fatal
      }

      // Build the proposal URL if a proposal ID was provided
      let proposalUrl: string | undefined;
      if (data.proposalId) {
        try {
          const { data: proposal } = await supabaseAdmin
            .from("project_proposals")
            .select("share_token")
            .eq("id", data.proposalId)
            .maybeSingle();
          if (proposal?.share_token) {
            proposalUrl = `${SITE_URL}/proposal/${proposal.share_token}`;
          }
        } catch {
          // Non-fatal
        }
      }

      // Send the discovery-recap email
      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("discovery-recap", data.email, {
          templateData: {
            name: data.name,
            businessName: data.businessName,
            summary: data.summary,
            recommendedTier: data.recommendedTier,
            whyFit: data.whyFit,
            timeline: data.timeline,
            investment: data.investment,
            deposit: data.deposit,
            includes: data.includes ?? [],
            proposalUrl,
          },
          idempotencyKey: `discovery-recap-${data.bookingId}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendDiscoveryRecap email error:", err);
        return { success: false, error: "Booking marked complete but recap email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 3. DESIGN APPROVAL REQUEST                                          */
/* ------------------------------------------------------------------ */

const designApprovalSchema = z.object({
  projectId: z.string().min(1).max(200),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  projectTitle: z.string().min(1).max(200),
  designUrl: z.string().url().max(500),
  notes: z.string().max(2000).optional(),
});

export const sendDesignApprovalRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof designApprovalSchema>) => designApprovalSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("design-approval-request", data.email, {
          templateData: {
            name: data.name,
            projectTitle: data.projectTitle,
            designUrl: data.designUrl,
            portalUrl: `${SITE_URL}/portal`,
            notes: data.notes,
          },
          idempotencyKey: `design-approval-${data.projectId}-${Math.floor(Date.now() / 60_000)}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendDesignApprovalRequest email error:", err);
        return { success: false, error: "Design approval email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 4. LAUNCH READY                                                     */
/* ------------------------------------------------------------------ */

const launchReadySchema = z.object({
  projectId: z.string().min(1).max(200),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  projectTitle: z.string().min(1).max(200),
  goLiveDate: z.string().max(200).optional(),
  checklist: z.array(z.string().max(300)).max(20).optional(),
});

export const sendLaunchReady = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof launchReadySchema>) => launchReadySchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("launch-ready", data.email, {
          templateData: {
            name: data.name,
            projectTitle: data.projectTitle,
            goLiveDate: data.goLiveDate,
            checklist: data.checklist ?? [],
            portalUrl: `${SITE_URL}/portal`,
          },
          idempotencyKey: `launch-ready-${data.projectId}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendLaunchReady email error:", err);
        return { success: false, error: "Launch-ready email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 5. POST-LAUNCH HANDOVER                                             */
/* ------------------------------------------------------------------ */

const handoverSchema = z.object({
  projectId: z.string().min(1).max(200),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  projectTitle: z.string().min(1).max(200),
  walkthroughUrl: z.string().url().max(500),
  quickStartItems: z.array(z.string().max(300)).max(20).optional(),
});

export const sendPostLaunchHandover = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof handoverSchema>) => handoverSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("post-launch-handover", data.email, {
          templateData: {
            name: data.name,
            projectTitle: data.projectTitle,
            walkthroughUrl: data.walkthroughUrl,
            portalUrl: `${SITE_URL}/portal`,
            quickStartItems: data.quickStartItems ?? [],
          },
          idempotencyKey: `post-launch-handover-${data.projectId}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendPostLaunchHandover email error:", err);
        return { success: false, error: "Handover email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 6. SUPPORT WINDOW CLOSING                                           */
/* ------------------------------------------------------------------ */

const supportClosingSchema = z.object({
  projectId: z.string().min(1).max(200),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  projectTitle: z.string().min(1).max(200),
  daysLeft: z.number().int().min(1).max(14).default(2),
});

export const sendSupportWindowClosing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof supportClosingSchema>) => supportClosingSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("support-window-closing", data.email, {
          templateData: {
            name: data.name,
            projectTitle: data.projectTitle,
            daysLeft: data.daysLeft,
            retainerUrl: `${SITE_URL}/pricing`,
          },
          idempotencyKey: `support-closing-${data.projectId}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendSupportWindowClosing email error:", err);
        return { success: false, error: "Support-window email failed to send." };
      }

      return { success: true, emailed };
    },
  );

/* ------------------------------------------------------------------ */
/* 7. RETAINER WEEKLY SYNC                                             */
/* ------------------------------------------------------------------ */

const weeklySyncSchema = z.object({
  projectTitle: z.string().min(1).max(200),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  shipped: z.array(z.string().max(300)).max(20).optional(),
  inProgress: z.array(z.string().max(300)).max(20).optional(),
  upNext: z.array(z.string().max(300)).max(20).optional(),
  blockers: z.string().max(2000).optional(),
});

export const sendRetainerWeeklySync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.infer<typeof weeklySyncSchema>) => weeklySyncSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ success: boolean; emailed?: boolean; error?: string }> => {
      await assertAdmin(context);

      let emailed = false;
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const res = await sendTemplateEmail("retainer-weekly-sync", data.email, {
          templateData: {
            name: data.name,
            shipped: data.shipped ?? [],
            inProgress: data.inProgress ?? [],
            upNext: data.upNext ?? [],
            blockers: data.blockers,
            portalUrl: `${SITE_URL}/portal`,
          },
          idempotencyKey: `retainer-sync-${data.email}-${new Date().toISOString().slice(0, 10)}`,
          replyTo: "rory@theroyeffect.com",
        });
        emailed = res.sent;
      } catch (err) {
        console.error("sendRetainerWeeklySync email error:", err);
        return { success: false, error: "Weekly sync email failed to send." };
      }

      return { success: true, emailed };
    },
  );
