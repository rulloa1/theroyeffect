import type { ComponentType } from "react";
import { template as bookingConfirmation } from "./booking-confirmation";
import { template as bookingNotification } from "./booking-notification";
import { template as briefConfirmation } from "./brief-confirmation";
import { template as briefNotification } from "./brief-notification";
import { template as clientWelcome } from "./client-welcome";
import { template as orderConfirmation } from "./order-confirmation";
import { template as orderNotification } from "./order-notification";
import { template as prospectOutreach } from "./prospect-outreach";
import { template as projectBriefNotification } from "./project-brief-notification";
import { template as proposalReady } from "./proposal-ready";
import { template as subscriptionNotification } from "./subscription-notification";
import { template as voiceAgentFollowup } from "./voice-agent-followup";
import { template as voiceAgentNotification } from "./voice-agent-notification";
import { template as auditDelivered } from "./audit-delivered";
import { template as discoveryRecap } from "./discovery-recap";
import { template as designApprovalRequest } from "./design-approval-request";
import { template as launchReady } from "./launch-ready";
import { template as postLaunchHandover } from "./post-launch-handover";
import { template as retainerWeeklySync } from "./retainer-weekly-sync";
import { template as supportWindowClosing } from "./support-window-closing";
import { template as redesignPitch } from "./redesign-pitch";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  "booking-confirmation": bookingConfirmation,
  "booking-notification": bookingNotification,
  "brief-confirmation": briefConfirmation,
  "brief-notification": briefNotification,
  "client-welcome": clientWelcome,
  "order-confirmation": orderConfirmation,
  "order-notification": orderNotification,
  "project-brief-notification": projectBriefNotification,
  "proposal-ready": proposalReady,
  "prospect-outreach": prospectOutreach,
  "subscription-notification": subscriptionNotification,
  "voice-agent-followup": voiceAgentFollowup,
  "voice-agent-notification": voiceAgentNotification,
  "audit-delivered": auditDelivered,
  "discovery-recap": discoveryRecap,
  "design-approval-request": designApprovalRequest,
  "launch-ready": launchReady,
  "post-launch-handover": postLaunchHandover,
  "retainer-weekly-sync": retainerWeeklySync,
  "support-window-closing": supportWindowClosing,
  "redesign-pitch": redesignPitch,
};
