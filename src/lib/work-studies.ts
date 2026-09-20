/**
 * Concept studies.
 *
 * Every study in this file is an INVENTED Houston business, used purely to
 * demonstrate how the work runs end to end. Nothing here describes a real
 * client engagement. Do not add client names, metrics, percentages, quotes or
 * testimonials to this file.
 */
import cutAfterAsset from "@/assets/cut-after.webp.asset.json";

export type StudyBlock = { title: string; body: string };

export type WorkStudy = {
  slug: string;
  index: string;
  name: string;
  sector: string;
  scopeTags: string[];
  summary: string;
  problemIntro: string;
  problems: string[];
  approach: StudyBlock[];
  outcomes: StudyBlock[];
  image: string;
  imageAlt: string;
};

/** The disclosure that must appear on every card and every detail page. */
export function studyDisclosure(study: WorkStudy): string {
  return `A concept study. ${study.name} is an invented Houston business, used to show how the work runs end to end — not a client engagement.`;
}

export const WORK_STUDIES: WorkStudy[] = [
  {
    slug: "marlow-sons-cabinetry",
    index: "01",
    name: "Marlow & Sons Cabinetry",
    sector: "Custom cabinetry · Spring, TX",
    scopeTags: ["Brand basics", "Mobile-first site", "Quote flow"],
    summary:
      "A cabinet shop whose website opened with its own history and hid the quote button three clicks deep.",
    problemIntro:
      "The business was busy but invisible online. Referrals kept it alive; the website actively worked against it. Four things showed up immediately:",
    problems: [
      "Five different logo versions in circulation, none of them usable at small sizes.",
      "A homepage that opened with a company history instead of what the business actually does.",
      "Quote requests buried three clicks deep, behind a form nobody could complete on a phone.",
      "Service pages written for the owner, not for the person searching at 9pm with a problem.",
    ],
    approach: [
      {
        title: "01 — Diagnose",
        body: "I started with the same 5-minute audit I offer free: walk the site as a first-time visitor on a phone, note every point of friction, and rank them by how much revenue they touch. Messaging and mobile quote flow came out on top; the logo was third.",
      },
      {
        title: "02 — Rebuild the brand basics",
        body: "One logo system with proper small-size and single-colour variants, a two-typeface pairing, and a tight colour set with real contrast rules. Enough of a system to stay consistent, not so much that nobody follows it.",
      },
      {
        title: "03 — Rewrite before redesign",
        body: "The homepage now leads with what the business does, who it does it for and where. Each service page answers the question that brings people there, then makes the next step obvious. Layout was designed around that copy, not the other way round.",
      },
      {
        title: "04 — Mobile-first build",
        body: "Designed at 360px first and scaled up. A short quote form above the fold, tap-to-call in the header, and no interstitial that hides the primary action on small screens.",
      },
      {
        title: "05 — Launch and hand over",
        body: "Shipped on a modern no-code / AI-assisted stack with forms, analytics and SEO basics wired up, plus a walkthrough so the owner can update copy without calling me.",
      },
    ],
    outcomes: [
      {
        title: "One consistent brand",
        body: "Site, invoices, truck decals and social profiles finally use the same mark, type and colours.",
      },
      {
        title: "A quote request that works on a phone",
        body: "The primary action is visible on the first screen on mobile, and completing it takes seconds rather than a scroll hunt.",
      },
      {
        title: "Pages that answer a search",
        body: "Each service has its own page with its own title, description and clear intent — so it can be found and shared on its own.",
      },
      {
        title: "An owner who can maintain it",
        body: "Copy edits, new services and new photos no longer require a developer.",
      },
    ],
    image: cutAfterAsset.url,
    imageAlt:
      "Redesigned Marlow & Sons homepage with a clear headline, booking button and shop illustration",
  },
  {
    slug: "hale-verde-architects",
    index: "02",
    name: "Hale & Verde Architects",
    sector: "Residential architecture · Houston Heights",
    scopeTags: ["Portfolio architecture", "Project template", "Enquiry flow"],
    summary:
      "A twelve-person studio whose best work lived in a 40MB PDF and whose website led with an About page.",
    problemIntro:
      "A practice that sells care, presenting itself carelessly. Four problems, in the order they cost the most:",
    problems: [
      "The portfolio was a download, so the work never appeared in search and could never be sent as a link.",
      "Project pages showed six renders in a row with no account of the site, the constraint, or the decision.",
      "The enquiry form asked for a budget range in field two, before the visitor had seen a reason to answer it.",
      "Body copy set at 13px in light grey — a practice that sells care, reading as careless.",
    ],
    approach: [
      {
        title: "01 — Read the work",
        body: "I sorted every project by what it demonstrates rather than by date, so the index shows the practice's range in one screen instead of showing whatever happened to finish last.",
      },
      {
        title: "02 — A project template that argues",
        body: "Site and constraint first, then the decision, then the photography — so the images land on a reader who already knows what they are looking at.",
      },
      {
        title: "03 — One image system",
        body: "Full-bleed plates, a single crop language, a slow fade on entry, and captions that name the material and the room rather than the file.",
      },
      {
        title: "04 — An enquiry that earns its questions",
        body: "What you are building, where, and when you want to start. Budget comes up on the call, once there is something to price.",
      },
      {
        title: "05 — Type that matches the practice",
        body: "A display face for project titles, body at 17px on a 68-character measure, and contrast that passes on every surface the site uses.",
      },
    ],
    outcomes: [
      {
        title: "The work leads",
        body: "The project index is the second screen of the homepage, not a file to download.",
      },
      {
        title: "Every project is findable",
        body: "Each has its own URL, title and description, so it can be searched, shared and cited.",
      },
      {
        title: "An enquiry that matches reality",
        body: "The form asks what a practice is actually briefed on, in the order a client can answer it.",
      },
      {
        title: "It reads as careful",
        body: "Type, measure and contrast now agree with what the practice sells.",
      },
    ],
    image: "/work/studio-presence.svg",
    imageAlt: "Abstract layout study of an architecture practice's project index",
  },
  {
    slug: "sabine-cypress-coffee",
    index: "03",
    name: "Sabine & Cypress Coffee",
    sector: "Coffee roaster · East End, Houston",
    scopeTags: ["Brand identity system", "Storefront", "Wholesale path"],
    summary:
      "A roaster whose bag design carried the whole brand, on a site that sent cafés and walk-ins to the same page.",
    problemIntro:
      "The packaging was doing all the work and nothing else was helping it. Four problems:",
    problems: [
      "The identity existed only on the bag — the site, the menu board and the invoices each looked like a different company.",
      "One page served two audiences: a wholesale buyer comparing suppliers, and a neighbour deciding where to get coffee.",
      "The mark was drawn for a 12oz bag and turned to mud at 16px in a browser tab.",
      "Product photography was shot in four different lights across two years, so the range never looked like a range.",
    ],
    approach: [
      {
        title: "01 — Work outward from the bag",
        body: "Keep what the packaging already earned, then build the system it implied: a mark that holds at 16px, a secondary wordmark for wide spaces, and a palette where roast level does the colour coding.",
      },
      {
        title: "02 — Split the audience",
        body: "A retail path that answers 'what should I buy' and a wholesale path that answers 'can you supply me', each with its own first screen and its own next step.",
      },
      {
        title: "03 — A storefront the owner can restock",
        body: "Products, roast dates and availability edited without a developer, because coffee changes weekly and websites should not need a ticket.",
      },
      {
        title: "04 — One photographic standard",
        body: "A single light setup, one background, one crop, applied across the whole range so the line photographs as a line.",
      },
      {
        title: "05 — Make the physical and the digital agree",
        body: "The same type and the same colours on the menu board, the bag and the site.",
      },
    ],
    outcomes: [
      {
        title: "One mark, every size",
        body: "It works on a 12oz bag and in a browser tab without a redraw.",
      },
      {
        title: "Two audiences, two paths",
        body: "Wholesale enquiries and retail orders stop competing for the same page.",
      },
      {
        title: "The range looks like a range",
        body: "One light, one crop, one background across every product.",
      },
      {
        title: "The owner keeps it current",
        body: "Roast dates and availability change without a phone call.",
      },
    ],
    image: "/work/brand-identity.svg",
    imageAlt: "Abstract brand identity system study — mark, wordmark and palette",
  },
];

export function findStudy(slug: string): WorkStudy | undefined {
  return WORK_STUDIES.find((study) => study.slug === slug);
}
