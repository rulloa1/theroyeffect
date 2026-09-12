import { SHOWCASE_WORK } from "@/lib/site-content";

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  url: string;
  category: "Brand Identity" | "UI/UX" | "No-Code";
  metric?: string | null;
  tags: string[];
  sort_order?: number;
  is_published?: boolean;
}

// Fallback when the showcase_projects table is empty or unreachable: the same
// live client sites shown on /work, so the drawer never lists placeholder work.
export const DEFAULT_SHOWCASE_PROJECTS: PortfolioProject[] = SHOWCASE_WORK.map((work, index) => ({
  id: `default-${work.slug}`,
  title: work.title,
  tagline: work.location,
  description: work.result,
  url: work.url,
  category: work.category,
  metric: null,
  tags: work.tags,
  sort_order: index + 1,
  is_published: true,
}));

export function mapShowcaseRow(p: Record<string, unknown>): PortfolioProject {
  return {
    id: String(p["id"]),
    title: String(p["title"]),
    tagline: String(p["tagline"]),
    description: String(p["description"]),
    url: String(p["url"]),
    category: p["category"] as "Brand Identity" | "UI/UX" | "No-Code",
    metric: typeof p["metric"] === "string" ? p["metric"] : null,
    tags: Array.isArray(p["tags"]) ? (p["tags"] as string[]) : [],
    sort_order: typeof p["sort_order"] === "number" ? p["sort_order"] : 0,
    is_published: typeof p["is_published"] === "boolean" ? p["is_published"] : true,
  };
}
