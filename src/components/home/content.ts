// Homepage copy. Everything a visitor or crawler needs to understand the offer
// lives here and is rendered as HTML — the WebGL layer only illustrates it.

export const BRAND = {
  name: "The Roy Effect",
  tagline: "Stand out online.",
  pillars: ["Strategy", "Websites", "AI", "Automation", "Growth"],
} as const;

export interface SceneCopy {
  id: "arrival" | "websites" | "ai" | "automation" | "growth" | "reveal";
  index: string;
  label: string;
  /** Headline lines, rendered one mask per line. */
  lines: string[];
  body?: string[];
}

export const SCENES: SceneCopy[] = [
  {
    id: "arrival",
    index: "01",
    label: "The arrival",
    lines: ["The Roy", "Effect"],
    body: ["Stand out online."],
  },
  {
    id: "websites",
    index: "02",
    label: "Websites",
    lines: ["Websites that", "turn visitors", "into customers."],
    body: ["Beautiful is only the beginning.", "We build digital experiences designed to convert."],
  },
  {
    id: "ai",
    index: "03",
    label: "AI",
    lines: ["Put AI", "to work."],
    body: ["AI systems that respond, qualify and work while you don't."],
  },
  {
    id: "automation",
    index: "04",
    label: "Automation",
    lines: ["Your business.", "Running 24/7."],
    body: [
      "Connect the systems.",
      "Automate the work.",
      "Never let another opportunity disappear.",
    ],
  },
  {
    id: "growth",
    index: "05",
    label: "Growth",
    lines: ["Build.", "Automate.", "Grow."],
    body: ["Turn attention into customers."],
  },
  {
    id: "reveal",
    index: "06",
    label: "The reveal",
    lines: ["The Roy Effect"],
    body: ["Stand out online."],
  },
];

export const WEBSITE_LABELS = ["Design", "UX", "Conversion", "Performance"] as const;

export const AI_WORKFLOW = [
  "New lead",
  "AI agent",
  "Qualify",
  "Follow up",
  "Appointment",
  "Booked",
] as const;

export const AUTOMATION_MODULES = [
  "Website",
  "CRM",
  "AI",
  "Email",
  "SMS",
  "Calendar",
  "Payments",
  "Reviews",
  "Reporting",
] as const;

export const AUTOMATION_FLOW = [
  "Website lead",
  "CRM",
  "AI qualification",
  "SMS",
  "Calendar",
  "Appointment",
  "Follow-up",
] as const;

/** Directional indicators only — deliberately no numbers. */
export const GROWTH_SIGNALS = [
  { label: "Leads", direction: "up" },
  { label: "Conversions", direction: "up" },
  { label: "Response time", direction: "down" },
  { label: "Manual work", direction: "down" },
] as const;

export interface HomeService {
  name: string;
  summary: string;
}

export const HOME_SERVICES: HomeService[] = [
  {
    name: "Websites",
    summary:
      "Fast, conversion-led sites that explain the offer in seconds and make the next step obvious.",
  },
  {
    name: "AI Agents",
    summary:
      "Assistants that answer enquiries, qualify leads and book appointments around the clock.",
  },
  {
    name: "Business Automation",
    summary:
      "The repetitive work between your tools — handed to systems that run without reminders.",
  },
  {
    name: "Lead Generation",
    summary: "Landing pages, offers and capture flows built to turn attention into enquiries.",
  },
  {
    name: "CRM & Follow-Up",
    summary: "Every lead tracked, every follow-up sent on time, nothing left in an inbox.",
  },
  {
    name: "Digital Strategy",
    summary:
      "A clear plan for how your website, AI and automation work together — before anything is built.",
  },
];

export interface ProcessStage {
  name: string;
  body: string;
}

export const EFFECT_PROCESS: ProcessStage[] = [
  {
    name: "Attract",
    body: "A site and message that make the right people stop and pay attention.",
  },
  {
    name: "Capture",
    body: "Clear offers and forms that turn a visit into a named, reachable lead.",
  },
  { name: "Qualify", body: "AI asks the right questions so your time goes to serious buyers." },
  {
    name: "Follow up",
    body: "Automated, personal follow-up by SMS and email while interest is warm.",
  },
  {
    name: "Convert",
    body: "Booking and payments built into the flow, so yes happens without friction.",
  },
  {
    name: "Grow",
    body: "Reviews, reporting and repeat business feed the system back into itself.",
  },
];

export const FOUNDER = {
  name: "Rory Ulloa",
  role: "Founder, The Roy Effect",
  lines: ["Technology doesn't", "grow businesses."],
  lines2: ["People who know", "how to use it do."],
  body: "The Roy Effect combines strategy, design, AI and automation to build businesses that operate differently.",
} as const;

export const WHY = {
  heading: ["One connected", "ecosystem."],
  body: "Most businesses run on tools that don't talk to each other — a website here, a CRM there, follow-up in someone's head. We connect them into one system, so every lead moves forward on its own.",
  disconnected: ["Website", "Inbox", "Sheets", "Calendar", "CRM", "Invoices"],
} as const;
