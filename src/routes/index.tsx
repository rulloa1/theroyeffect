import { createFileRoute } from "@tanstack/react-router";
import { MarkupHome } from "@/components/markup/MarkupHome";
import { MARKUP_FONT_PRELOADS } from "@/components/markup/fonts";
import { SITE_URL } from "@/lib/site";
import ogImageAsset from "@/assets/og-markup.jpg.asset.json";

// Asset URLs may already be absolute; only prefix the site when they're not.
const OG_IMAGE = /^https?:\/\//.test(ogImageAsset.url) ? ogImageAsset.url : `${SITE_URL}${ogImageAsset.url}`;
const OG_ALT = "Your work is better than your website. A marked-up homepage with three numbered fixes.";
const TITLE = "Houston Web Design — Rory Ulloa | The Roy Effect";
const DESCRIPTION =
  "Send your URL and get a free five-minute video teardown of your website, with three fixes ranked by impact. Brand, web design and build by Rory Ulloa in Houston.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_ALT },
    ],
    links: [...MARKUP_FONT_PRELOADS, { rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: MarkupHome,
});
