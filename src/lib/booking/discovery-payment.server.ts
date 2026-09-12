/**
 * Fulfilment for paid discovery calls.
 *
 * The slot is only reserved once Stripe reports the checkout as paid. Both the
 * webhook and the return page call `fulfillPaidDiscoveryBooking`, so it must be
 * idempotent — the Stripe checkout session id is the fulfilment key.
 */
import {
  bookDiscoverySlot,
  formatSlot,
  BOOKING_TZ,
  OWNER_EMAIL,
  SLOT_TAKEN_MESSAGE,
} from "@/utils/booking.server";
import { escapeLikePattern } from "@/lib/sql-like";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";
import type { StripeEnv } from "@/lib/stripe.server";

export const DISCOVERY_PRICE_KEY = "discovery_call_fee";
export const DISCOVERY_FEE_CENTS = 4900;

export interface DiscoveryPaymentSession {
  id: string;
  amountTotal: number;
  currency: string;
  email: string | null;
  /** Needed to refund a payment whose slot could not be booked. */
  paymentIntentId: string | null;
  env: StripeEnv;
  metadata: Record<string, string | undefined>;
}

export interface DiscoveryFulfilmentResult {
  /** "refunded": paid, but the slot could not be booked, so the fee was returned. */
  status: "booked" | "already_booked" | "invalid" | "refunded";
  bookingId?: string;
  spokenTime?: string;
  timeZone?: string;
  message?: string;
}

async function admin() {
  const mod = await import("@/integrations/supabase/client.server");
  return (mod as unknown as { supabaseAdmin: any }).supabaseAdmin;
}

/**
 * Mirrors the paid discovery call into the client portal so the client sees a
 * completed milestone the moment the payment lands.
 */
async function syncPortalDiscoveryMilestone(input: {
  email: string;
  fullName: string;
  spoken: string;
  amountLabel: string;
}) {
  const db = await admin();
  const email = input.email.toLowerCase();

  const { data: existingProject } = await db
    .from("client_projects")
    .select("id")
    .ilike("client_email", escapeLikePattern(email))
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let projectId = existingProject?.id as string | undefined;

  if (!projectId) {
    const { data: created, error } = await db
      .from("client_projects")
      .insert({
        client_email: email,
        title: `${input.fullName} — Discovery`,
        summary: "Started from a paid discovery call booked on the site.",
        status: "onboarding",
      })
      .select("id")
      .single();
    if (error) {
      console.error("Portal project creation failed:", error.message);
      return;
    }
    projectId = created.id as string;
  }

  const title = "Discovery call";
  const note = `Paid ${input.amountLabel} · ${input.spoken} (${BOOKING_TZ})`;

  const { data: milestone } = await db
    .from("client_milestones")
    .select("id")
    .eq("project_id", projectId)
    .eq("title", title)
    .limit(1)
    .maybeSingle();

  if (milestone?.id) {
    await db
      .from("client_milestones")
      .update({ status: "done", note, updated_at: new Date().toISOString() })
      .eq("id", milestone.id);
    return;
  }

  await db
    .from("client_milestones")
    .insert({ project_id: projectId, title, note, status: "done", position: 0 });
}

/** Errors from bookDiscoverySlot that no retry can fix: the client will never get this slot. */
function isUnbookable(message: string): boolean {
  return (
    message === SLOT_TAKEN_MESSAGE ||
    message === "That time is no longer available." ||
    message === "That time isn't one of the slots on offer."
  );
}

/**
 * Refunds a discovery payment whose slot was lost (e.g. two clients paying for the
 * same time at once) and tells Rory. Idempotent on the checkout session, so the
 * webhook and the return page can both reach it without double-refunding.
 */
async function refundUnbookablePayment(
  session: DiscoveryPaymentSession,
  slotStart: string,
  reason: string,
): Promise<boolean> {
  if (!session.paymentIntentId) return false;
  try {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const stripe = createStripeClient(session.env);
    await stripe.refunds.create(
      {
        payment_intent: session.paymentIntentId,
        reason: "requested_by_customer",
        metadata: { purpose: "discovery_call_unbookable", checkout_session_id: session.id },
      },
      { idempotencyKey: `discovery-refund-${session.id}` },
    );
  } catch (error) {
    console.error(`REFUND REQUIRED (automatic refund failed) for session ${session.id}:`, error);
    return false;
  }

  const meta = session.metadata;
  await sendTemplateEmail("booking-notification", OWNER_EMAIL, {
    templateData: {
      name: meta["full_name"] ?? "Unknown",
      email: meta["email"] ?? session.email ?? "",
      phone: meta["phone"],
      when: `NOT BOOKED — ${formatSlot(new Date(slotStart))} (${BOOKING_TZ})`,
      notes: `Payment was refunded automatically: ${reason} Reach out to offer another time.`,
    },
    idempotencyKey: `discovery-refund-notice-${session.id}`,
  }).catch((e) => console.error("Refund notice email failed:", e));
  return true;
}

export async function fulfillPaidDiscoveryBooking(
  session: DiscoveryPaymentSession,
): Promise<DiscoveryFulfilmentResult> {
  const db = await admin();

  if (session.metadata["purpose"] !== "discovery_call") {
    return { status: "invalid", message: "That payment is not a discovery call." };
  }
  if (session.amountTotal < DISCOVERY_FEE_CENTS) {
    console.error(`Discovery session ${session.id} paid ${session.amountTotal}, below the fee`);
    return { status: "invalid", message: "That payment does not cover the discovery call fee." };
  }

  const { data: existing } = await db
    .from("voice_bookings")
    .select("id, slot_start, time_zone")
    .eq("stripe_session_id", session.id)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return {
      status: "already_booked",
      bookingId: existing.id as string,
      spokenTime: formatSlot(new Date(existing.slot_start as string)),
      // Always Central: spokenTime is formatted in BOOKING_TZ, not the stored browser zone.
      timeZone: BOOKING_TZ,
    };
  }

  const meta = session.metadata;
  const slotStart = meta["slot_start"];
  const fullName = meta["full_name"];
  const email = meta["email"] ?? session.email ?? undefined;

  if (!slotStart || !fullName || !email) {
    return { status: "invalid", message: "Booking details were missing from the payment." };
  }

  let booking: Awaited<ReturnType<typeof bookDiscoverySlot>>;
  try {
    booking = await bookDiscoverySlot(
      {
        full_name: fullName,
        email,
        ...(meta["phone"] ? { phone: meta["phone"] } : {}),
        slot_start: slotStart,
        time_zone: meta["time_zone"] || BOOKING_TZ,
        ...(meta["notes"] ? { notes: meta["notes"] } : {}),
      },
      {
        stripe_session_id: session.id,
        amount_paid_cents: session.amountTotal,
        currency: session.currency,
        sms_service_consent: meta["sms_service_consent"] === "true",
        sms_marketing_consent: meta["sms_marketing_consent"] === "true",
      },
    );
  } catch (err) {
    // Returning instead of throwing keeps the webhook from retrying for three
    // days on something no retry can fix — a taken slot, or a time that is no
    // longer on offer. Those are refunded straight away instead of left for a
    // console line nobody reads.
    const message = err instanceof Error ? err.message : "Booking failed";
    console.error(`Discovery fulfilment failed for session ${session.id}: ${message}`);
    if (isUnbookable(message) && (await refundUnbookablePayment(session, slotStart, message))) {
      return {
        status: "refunded",
        message:
          "That time was taken before your payment finished, so your $49 has been refunded. Please pick another time.",
      };
    }
    return { status: "invalid", message };
  }

  // The other fulfilment path (webhook or return page) got there first and has
  // already sent the confirmation emails and synced the portal.
  if (booking.already_booked) {
    return {
      status: "already_booked",
      bookingId: booking.booking_id,
      spokenTime: booking.spoken_time,
      timeZone: booking.time_zone,
    };
  }

  const amountLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (session.currency || "usd").toUpperCase(),
  }).format(session.amountTotal / 100);

  try {
    await syncPortalDiscoveryMilestone({
      email,
      fullName,
      spoken: booking.spoken_time,
      amountLabel,
    });
  } catch (error) {
    console.error("Portal milestone sync failed:", error);
  }

  return {
    status: "booked",
    bookingId: booking.booking_id,
    spokenTime: booking.spoken_time,
    timeZone: booking.time_zone,
  };
}
