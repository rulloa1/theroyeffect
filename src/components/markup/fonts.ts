import bricolageLatin from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url";
import hankenLatin from "@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url";

/**
 * Above-the-fold faces for pages on The Markup. Spread into a route's
 * head().links. Martian Mono is left to load on demand: it only sets labels,
 * and its fallback is metric-matched in styles/markup.css.
 */
export const MARKUP_FONT_PRELOADS = [
  {
    rel: "preload",
    href: bricolageLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "preload", href: hankenLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
] as const;
