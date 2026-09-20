/**
 * Capture + audit stages of the Redesign Studio pipeline.
 *
 * The fetch itself is the prospecting scanner's — it already validates every
 * redirect hop against the public-address rules — so this module only adds the
 * structural extraction the redesign needs on top of the objective signals.
 */

import { scanWebsiteDocument, scoreProspect } from "@/lib/prospecting/scan.server";
import type { SiteAudit, SiteCapture } from "./types";

const BAD_EMAIL = /(example|sentry|wixpress|\.png|\.jpg|\.webp|\.gif|godaddy|domain|noreply)/i;

/** Strips script/style/comments, then all tags, leaving readable text. */
export function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

/** Pulls the text of every matching tag, de-duplicated and length-capped. */
function tagText(html: string, tag: string, limit: number): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(pattern)) {
    const text = decodeEntities(visibleText(match[1] ?? ""));
    if (!text || text.length > 160) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

/** Nav link labels, which say more about their site map than headings do. */
export function extractNavLabels(html: string): string[] {
  const navBlocks = [...html.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gi)].map((m) => m[1] ?? "");
  const scope = navBlocks.length > 0 ? navBlocks.join(" ") : html.slice(0, 20_000);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const match of scope.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = decodeEntities(visibleText(match[1] ?? ""));
    if (!text || text.length > 40 || /^[^a-z]*$/i.test(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= 12) break;
  }
  return out;
}

/** Colours in the markup, most frequent first — the current brand, such as it is. */
export function extractPalette(html: string): string[] {
  const counts = new Map<string, number>();
  const push = (raw: string) => {
    let hex = raw.toLowerCase();
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    // Pure black and white say nothing about a brand.
    if (hex === "#ffffff" || hex === "#000000") return;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  };
  for (const match of html.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)) push(match[0]);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex);
}

export function extractFonts(html: string): string[] {
  const out = new Set<string>();
  // The first family only, quoted or bare. Matching the quoted forms
  // explicitly is what stops the bare case from running past the end of a
  // style attribute.
  const declaration = /font-family\s*:\s*(?:"([^"]{1,40})"|'([^']{1,40})'|([^;"'}<>,]{1,40}))/gi;
  for (const match of html.matchAll(declaration)) {
    const first = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (first && !/^(inherit|initial|unset|revert|var\()/i.test(first)) out.add(first);
  }
  for (const match of html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^&"')]+)/gi)) {
    const family = decodeURIComponent(match[1] ?? "")
      .split(":")[0]
      ?.replace(/\+/g, " ")
      .trim();
    if (family) out.add(family);
  }
  return [...out].slice(0, 6);
}

function extractContactEmail(html: string): string | null {
  const mailto = html.match(/mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)?.[1];
  if (mailto && !BAD_EMAIL.test(mailto)) return mailto.toLowerCase();
  for (const candidate of html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) {
    if (!BAD_EMAIL.test(candidate)) return candidate.toLowerCase();
  }
  return null;
}

function extractPhone(html: string): string | null {
  const tel = html.match(/tel:\+?([0-9().\-\s]{7,20})/i)?.[1];
  if (tel) return tel.trim();
  return html.match(/\(?\b\d{3}\)?[.\-\s]\d{3}[.\-\s]\d{4}\b/)?.[0]?.trim() ?? null;
}

/**
 * Infers the trading name: og:site_name first, then the part of <title> before
 * a separator, then the hostname.
 */
export function inferBusinessName(html: string, title: string | null, host: string): string {
  const og = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{2,80})["']/i,
  )?.[1];
  if (og?.trim()) return decodeEntities(og);

  if (title) {
    const lead = title.split(/\s[|·—–-]\s/)[0]?.trim();
    if (lead && lead.length >= 3 && lead.length <= 60) return decodeEntities(lead);
  }

  const bare = host.replace(/^www\./i, "").split(".")[0] ?? host;
  return bare
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Fetches the prospect's homepage once and records both the objective signals
 * and the structure the redesign is generated from.
 */
export async function captureSite(
  url: string,
  host: string,
): Promise<{ capture: SiteCapture; audit: SiteAudit }> {
  const { scan, html } = await scanWebsiteDocument(url);

  if (!html) {
    const { score, signals } = scoreProspect({ hasWebsite: true, scan });
    return {
      capture: {
        finalUrl: scan.finalUrl,
        reachable: false,
        statusCode: scan.statusCode,
        loadMs: scan.loadMs,
        https: scan.https,
        mobileFriendly: false,
        title: null,
        metaDescription: null,
        businessName: inferBusinessName("", null, host),
        contactEmail: null,
        phone: null,
        headings: [],
        navLabels: [],
        palette: [],
        fonts: [],
        imageCount: 0,
        wordCount: 0,
        hasContactForm: false,
        hasPhoneLink: false,
        hasBookingCta: false,
        copyrightYear: null,
        excerpt: null,
      },
      audit: { score, signals },
    };
  }

  const text = visibleText(html);
  const { score, signals } = scoreProspect({ hasWebsite: true, scan });

  return {
    capture: {
      finalUrl: scan.finalUrl,
      reachable: scan.reachable,
      statusCode: scan.statusCode,
      loadMs: scan.loadMs,
      https: scan.https,
      mobileFriendly: scan.mobileFriendly,
      title: scan.title,
      metaDescription: scan.metaDescription,
      businessName: inferBusinessName(html, scan.title, host),
      contactEmail: extractContactEmail(html),
      phone: extractPhone(html),
      headings: [...tagText(html, "h1", 4), ...tagText(html, "h2", 8)].slice(0, 10),
      navLabels: extractNavLabels(html),
      palette: extractPalette(html),
      fonts: extractFonts(html),
      imageCount: (html.match(/<img\b/gi) ?? []).length,
      wordCount: text ? text.split(/\s+/).length : 0,
      hasContactForm: scan.hasContactForm,
      hasPhoneLink: scan.hasPhoneLink,
      hasBookingCta: scan.hasBookingCta,
      copyrightYear: scan.copyrightYear,
      excerpt: text ? text.slice(0, 4000) : null,
    },
    audit: { score, signals },
  };
}
