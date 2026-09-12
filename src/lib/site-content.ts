// Shared, client-safe editorial content used by both the drawer panels and the
// standalone indexable /services and /pricing routes.

export interface ServiceEntry {
  slug: string;
  name: string;
  summary: string;
  from: string;
  deliverables: string[];
}

export const SERVICES: ServiceEntry[] = [
  {
    slug: "brand-identity",
    name: "Brand identity & visual systems",
    summary:
      "Strategy, logo system and guidelines for early-stage teams and personal brands that need a coherent look before they scale.",
    from: "$2,500",
    deliverables: [
      "Brand strategy workshop",
      "Logo system + variations",
      "Color palette & typography",
      "Written brand guidelines",
      "Two revision rounds",
    ],
  },
  {
    slug: "web-design-uiux",
    name: "Web design & UI/UX",
    summary:
      "Full visual design for websites, apps and digital products — wireframes through high-fidelity, responsive screens and a clickable prototype.",
    from: "$5,000",
    deliverables: [
      "UX audit & wireframes",
      "High-fidelity UI design",
      "Responsive mobile → desktop screens",
      "Clickable prototype",
      "Three revision rounds",
    ],
  },
  {
    slug: "design-and-build",
    name: "Design + no-code build",
    summary:
      "End-to-end: I design it and I ship it. Production build on a modern no-code / AI-assisted stack with forms, payments, analytics and SEO wired up.",
    from: "$8,000",
    deliverables: [
      "Everything in web design",
      "No-code / AI-assisted development",
      "CMS, forms & payments",
      "Launch, analytics & SEO basics",
    ],
  },
  {
    slug: "design-retainer",
    name: "Design retainer",
    summary:
      "A monthly creative-direction and design partnership for teams that ship continuously and need design capacity without a hire.",
    from: "$3,000/mo",
    deliverables: [
      "Ongoing design & build capacity",
      "Priority turnaround",
      "Design system upkeep",
      "Weekly async sync",
      "Pause or cancel anytime",
    ],
  },
];

export interface ShowcaseWorkEntry {
  slug: string;
  title: string;
  eyebrow: string;
  result: string;
  image: string | null;
  alt: string;
  /** Live, public URL of the shipped client site. */
  url: string;
  location: string;
  category: "Brand Identity" | "UI/UX" | "No-Code";
  tags: string[];
}

// Live client sites. Screenshots live in public/work/live/ (960×720 WebP).
// The first three are shown in the homepage "Recent work" strip.
export const SHOWCASE_WORK: ShowcaseWorkEntry[] = [
  {
    slug: "pinewood-trails",
    title: "Pinewood Trails RV Park",
    eyebrow: "MAGNOLIA, TX · WEBSITE + BOOKING",
    result:
      "RV park site with a stay-search booking panel, amenities, sites & rates, and an interactive park map.",
    image: "/work/live/pinewood-trails.webp",
    alt: "Homepage of the Pinewood Trails RV Park website with its book-your-stay panel",
    url: "https://pinewood-trails.theroyeffect.com/",
    location: "Magnolia, TX",
    category: "UI/UX",
    tags: ["Website", "Booking", "Park Map"],
  },
  {
    slug: "days-inn-wildwood",
    title: "Days Inn Wildwood I-75",
    eyebrow: "WILDWOOD, FL · HOTEL WEBSITE",
    result:
      "Direct-booking hotel site: availability search, room types, amenities and a local guide for I-75 travelers.",
    image: "/work/live/days-inn-wildwood.webp",
    alt: "Homepage of the Days Inn Wildwood I-75 website with its availability search",
    url: "https://www.daysinn.app/",
    location: "Wildwood, FL",
    category: "UI/UX",
    tags: ["Website", "Hospitality", "Direct Booking"],
  },
  {
    slug: "dunrite-construction",
    title: "DunRite Construction Group",
    eyebrow: "CENTRAL FLORIDA · CONTRACTOR SITE",
    result:
      "Bold site for a concrete & shell contractor — services, project work and quote requests for builders across Central Florida.",
    image: "/work/live/dunrite-construction.webp",
    alt: "Homepage of the DunRite Construction Group website reading From the ground to roof",
    url: "https://www.dunriteconstruction.app/",
    location: "Central Florida",
    category: "UI/UX",
    tags: ["Website", "Construction", "Lead Gen"],
  },
  {
    slug: "michael-chandler",
    title: "Michael Chandler",
    eyebrow: "CONSTRUCTION EXECUTIVE · PORTFOLIO",
    result:
      "Executive portfolio for a construction leader with 37+ years of work — project galleries, design work and an inquiry flow.",
    image: "/work/live/michael-chandler.webp",
    alt: "Homepage of the Michael Chandler construction executive portfolio",
    url: "https://constructiondesignnew.lovable.app/",
    location: "Houston, TX",
    category: "No-Code",
    tags: ["Portfolio", "Personal Brand", "No-Code Build"],
  },
  {
    slug: "oasis-rv-park",
    title: "Oasis MH & RV Park",
    eyebrow: "INVERNESS, FL · WEBSITE + PARK MAP",
    result:
      "Community site for an adult mobile home & RV park with nightly rates and an interactive map for picking a site.",
    image: "/work/live/oasis-rv-park.webp",
    alt: "Homepage of the Oasis Mobile Home and RV Park website",
    url: "https://oasisadultpark.lovable.app/",
    location: "Inverness, FL",
    category: "No-Code",
    tags: ["Website", "Park Map", "No-Code Build"],
  },
  {
    slug: "devine-family-pawn",
    title: "Devine Family Jewelry & Pawn",
    eyebrow: "BUSHNELL, FL · WEBSITE + INVENTORY",
    result:
      "Local pawn shop site with a browsable inventory, pawn loan and repair info, and a staff login to manage listings.",
    image: "/work/live/devine-family-pawn.webp",
    alt: "Homepage of the Devine Family Jewelry and Pawn website",
    url: "https://devinefamilypawn.lovable.app/",
    location: "Bushnell, FL",
    category: "No-Code",
    tags: ["Website", "Inventory", "Staff Dashboard"],
  },
  {
    slug: "mrc-construction",
    title: "MRC Construction LLC",
    eyebrow: "HOUSTON, TX · REMODELING SITE",
    result:
      "Luxury bathroom remodeling site — walk-in showers, custom tile and a click-to-call path for Houston homeowners.",
    image: null,
    alt: "MRC Construction LLC website",
    url: "https://mrc-construction.royscompany.workers.dev/",
    location: "Houston, TX",
    category: "UI/UX",
    tags: ["Website", "Remodeling", "Lead Gen"],
  },
];

export interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "Brief & scope",
    body: "You send a short brief — goals, audience, timeline, budget. I come back with a fixed scope, a price, and a start date. Nothing begins until both are agreed in writing.",
  },
  {
    step: "02",
    title: "Direction",
    body: "One focused round of visual direction: type, colour, layout language and the tone of the interface. I lock a single direction with you before any production work starts.",
  },
  {
    step: "03",
    title: "Design",
    body: "Full screens designed responsively, mobile through desktop, with real content instead of placeholder text. Revision rounds are set by your tier — two on a Brand Sprint, three on web design and design + build.",
  },
  {
    step: "04",
    title: "Build & launch",
    body: "I build the approved design as a live, responsive site — forms, payments, analytics and SEO basics wired up — then hand over access and a short walkthrough.",
  },
  {
    step: "05",
    title: "After launch",
    body: "Post-launch support is included for the first two weeks. Teams that keep shipping move onto a monthly retainer for continuous design and build work.",
  },
];
