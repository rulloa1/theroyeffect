import { createFileRoute } from "@tanstack/react-router";
import { PortfolioHeader } from "@/components/PortfolioHeader";
import { HeroContent } from "@/components/HeroContent";
import { PortfolioWorkGallery } from "@/components/PortfolioWorkGallery";
import { PortfolioSections } from "@/components/PortfolioSections";
import { SITE_URL } from "@/lib/site";
import ogImageAsset from "@/assets/og-preview.jpg.asset.json";

const HERO_IMAGE_ABSOLUTE = `${SITE_URL}${ogImageAsset.url}`;
const TITLE = "Houston Web Design — Rory Ulloa | The Roy Effect";
const DESCRIPTION =
  "Houston web design, UI/UX, brand systems and no-code builds by independent creative director Rory Ulloa. Free personalised video website audit.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: HERO_IMAGE_ABSOLUTE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMAGE_ABSOLUTE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--ground)]">
      <PortfolioHeader />
      <section
        data-home-hero
        className="relative z-20 bg-[var(--ground)] px-2 pb-2 md:px-4 md:pb-4"
      >
        <HeroContent />
      </section>
      <PortfolioWorkGallery />
      <PortfolioSections />
    </main>
  );
}
