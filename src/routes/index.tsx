import { createFileRoute } from "@tanstack/react-router";
import { ParticleBackground } from "@/components/ParticleBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroContent } from "@/components/HeroContent";
import { PortfolioWorkGallery } from "@/components/PortfolioWorkGallery";
import { PortfolioSections } from "@/components/PortfolioSections";
import ogImageAsset from "@/assets/og-preview.jpg.asset.json";

const HERO_IMAGE_ABSOLUTE = `https://theroyeffect.com${ogImageAsset.url}`;
const TITLE = "Rory Ulloa — Design Developer & Web Developer | The Roy Effect";
const DESCRIPTION =
  "Design developer and web developer Rory Ulloa creates memorable, conversion-focused websites, UI/UX, motion and interactive digital experiences from Houston, Texas.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroyeffect.com/" },
      { property: "og:image", content: HERO_IMAGE_ABSOLUTE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMAGE_ABSOLUTE },
    ],
    links: [{ rel: "canonical", href: "https://theroyeffect.com/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-[#030014]">
      <ParticleBackground />
      <SiteHeader />
      <section data-home-hero className="relative z-20 bg-[#030014] px-2 pb-2 md:px-4 md:pb-4">
        <HeroContent />
      </section>
      <PortfolioWorkGallery />
      <PortfolioSections />
    </main>
  );
}
