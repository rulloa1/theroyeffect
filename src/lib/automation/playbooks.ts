export const FOLLOWUP_PLAYBOOKS = {
  new_lead_no_contact: {
    label: "New lead, no contact yet",
    goal: "Thank them for reaching out, restate what they said they need, and ask them to book a free discovery call.",
    ctaLabel: "Book a discovery call",
    ctaPath: "/book",
  },
  inquiry_unanswered: {
    label: "Contact form inquiry unanswered",
    goal: "Reply to their message personally, acknowledge the specific project they described, and invite them to book a call.",
    ctaLabel: "Book a discovery call",
    ctaPath: "/book",
  },
  audit_pending: {
    label: "Free audit requested",
    goal: "Confirm the audit is underway, name the site they asked about and the bottleneck they mentioned, and set expectations for a short call to walk through findings.",
    ctaLabel: "Book your audit walkthrough",
    ctaPath: "/book",
  },
  booking_no_show: {
    label: "Missed discovery call",
    goal: "Warm, no-guilt note about the missed call and a direct invitation to pick a new time.",
    ctaLabel: "Pick a new time",
    ctaPath: "/book",
  },
  post_call_no_proposal: {
    label: "Call happened, no proposal yet",
    goal: "Recap the call at a high level, confirm scope direction, and tell them a scoped proposal is coming — ask for anything still missing.",
    ctaLabel: "See services and pricing",
    ctaPath: "/pricing",
  },
  abandoned_deposit: {
    label: "Checkout started, deposit unpaid",
    goal: "Gentle nudge that their deposit checkout is still open, restate what the tier includes, and offer to answer questions before they pay.",
    ctaLabel: "Finish your booking",
    ctaPath: "/pricing",
  },
  prospect_intro: {
    label: "Deal Finder prospect, first touch",
    goal: "Cold first email to a business owner I have never spoken to. Name one specific gap from my findings, say plainly what I would fix and why it earns them money, and ask for a short call. Do not pretend we have spoken.",
    ctaLabel: "Book a 15-minute call",
    ctaPath: "/book",
  },
  prospect_bump: {
    label: "Deal Finder prospect, second touch",
    goal: "Short, polite follow-up to my earlier email that got no reply. Add one new, different finding, keep it under 70 words, and ask if a quick call is worth it.",
    ctaLabel: "Book a 15-minute call",
    ctaPath: "/book",
  },
  prospect_breakup: {
    label: "Deal Finder prospect, final touch",
    goal: "Last, respectful note: I will stop emailing, the offer stands, and they can reply any time. Under 50 words, no pressure.",
    ctaLabel: "See services and pricing",
    ctaPath: "/pricing",
  },
} as const;

/** Days after the previous sent touch before the next Deal Finder touch is drafted. */
export const PROSPECT_SEQUENCE = [
  { playbook: "prospect_intro", afterDays: 0 },
  { playbook: "prospect_bump", afterDays: 4 },
  { playbook: "prospect_breakup", afterDays: 10 },
] as const;

export type PlaybookKey = keyof typeof FOLLOWUP_PLAYBOOKS;

export { SITE_URL } from "@/lib/site";
