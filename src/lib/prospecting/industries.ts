/** Client-safe industry catalogue for the prospect finder. */

export interface IndustryDef {
  key: string;
  label: string;
  group: "home_services" | "health_wellness" | "professional";
  /** Overpass tag filters — each entry becomes one nwr[...] clause. */
  filters: string[];
  /** Plain-language descriptor used in outreach copy. */
  descriptor: string;
}

export const INDUSTRIES: IndustryDef[] = [
  // Home services
  {
    key: "roofing",
    label: "Roofers",
    group: "home_services",
    filters: ['["craft"="roofer"]', '["shop"="roofing"]'],
    descriptor: "roofing company",
  },
  {
    key: "hvac",
    label: "HVAC",
    group: "home_services",
    filters: ['["craft"="hvac"]', '["shop"="hvac"]'],
    descriptor: "HVAC company",
  },
  {
    key: "plumbing",
    label: "Plumbers",
    group: "home_services",
    filters: ['["craft"="plumber"]', '["shop"="plumber"]'],
    descriptor: "plumbing company",
  },
  {
    key: "electrician",
    label: "Electricians",
    group: "home_services",
    filters: ['["craft"="electrician"]'],
    descriptor: "electrical contractor",
  },
  {
    key: "landscaping",
    label: "Landscapers",
    group: "home_services",
    filters: ['["craft"="gardener"]', '["shop"="garden_centre"]', '["landuse"="plant_nursery"]'],
    descriptor: "landscaping company",
  },
  {
    key: "remodeling",
    label: "Remodelers",
    group: "home_services",
    filters: ['["craft"="carpenter"]', '["craft"="builder"]', '["shop"="doityourself"]'],
    descriptor: "remodeling contractor",
  },
  // Health & wellness
  {
    key: "med_spa",
    label: "Med spas & beauty",
    group: "health_wellness",
    filters: ['["shop"="beauty"]', '["leisure"="spa"]', '["shop"="massage"]'],
    descriptor: "med spa",
  },
  {
    key: "dentist",
    label: "Dentists",
    group: "health_wellness",
    filters: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
    descriptor: "dental practice",
  },
  {
    key: "gym",
    label: "Gyms & studios",
    group: "health_wellness",
    filters: ['["leisure"="fitness_centre"]', '["sport"="yoga"]'],
    descriptor: "gym",
  },
  {
    key: "chiropractor",
    label: "Chiropractors",
    group: "health_wellness",
    filters: ['["healthcare"="chiropractor"]', '["healthcare:speciality"="chiropractic"]'],
    descriptor: "chiropractic clinic",
  },
  {
    key: "clinic",
    label: "Clinics & physicians",
    group: "health_wellness",
    filters: ['["amenity"="doctors"]', '["healthcare"="physiotherapist"]'],
    descriptor: "clinic",
  },
  // Professional services
  {
    key: "law",
    label: "Law firms",
    group: "professional",
    filters: ['["office"="lawyer"]'],
    descriptor: "law firm",
  },
  {
    key: "accounting",
    label: "Accountants",
    group: "professional",
    filters: ['["office"="accountant"]', '["office"="tax_advisor"]'],
    descriptor: "accounting firm",
  },
  {
    key: "real_estate",
    label: "Real estate",
    group: "professional",
    filters: ['["office"="estate_agent"]'],
    descriptor: "real estate office",
  },
  {
    key: "insurance",
    label: "Insurance brokers",
    group: "professional",
    filters: ['["office"="insurance"]'],
    descriptor: "insurance agency",
  },
  {
    key: "financial",
    label: "Financial advisors",
    group: "professional",
    filters: ['["office"="financial"]', '["office"="financial_advisor"]'],
    descriptor: "financial advisory firm",
  },
];

export const INDUSTRY_GROUPS: { key: IndustryDef["group"]; label: string }[] = [
  { key: "home_services", label: "Home services" },
  { key: "health_wellness", label: "Health & wellness" },
  { key: "professional", label: "Professional services" },
];

export const getIndustry = (key: string) => INDUSTRIES.find((i) => i.key === key);

/** Greater Houston bounding box: south, west, north, east. */
export const HOUSTON_BBOX = [29.52, -95.79, 30.11, -95.01] as const;

/** Search areas for the Deal Finder. Bounding boxes are south, west, north, east. */
export const CITIES = [
  { key: "houston", label: "Houston, TX", bbox: HOUSTON_BBOX },
  { key: "austin", label: "Austin, TX", bbox: [30.1, -97.94, 30.52, -97.56] as const },
  { key: "san_antonio", label: "San Antonio, TX", bbox: [29.25, -98.73, 29.67, -98.3] as const },
  { key: "dallas", label: "Dallas, TX", bbox: [32.62, -97.0, 33.02, -96.55] as const },
  { key: "fort_worth", label: "Fort Worth, TX", bbox: [32.6, -97.5, 32.95, -97.15] as const },
] as const;

export type CityKey = (typeof CITIES)[number]["key"];
export const CITY_KEYS = CITIES.map((c) => c.key) as [CityKey, ...CityKey[]];
export const getCity = (key: string | undefined) => CITIES.find((c) => c.key === key) ?? CITIES[0];

export interface ProspectSignal {
  code: string;
  label: string;
  detail: string;
  weight: number;
  severity: "critical" | "warning" | "info";
}
