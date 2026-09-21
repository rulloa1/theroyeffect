import { createFileRoute } from "@tanstack/react-router";
// Split by concern to stay under the 500-line file limit; link order preserves the cascade.
import homeBaseCss from "@/components/home/home-base.css?url";
import homeExperienceCss from "@/components/home/home-experience.css?url";
import homeExperienceMotionCss from "@/components/home/home-experience-motion.css?url";
import homeSectionsCss from "@/components/home/home-sections.css?url";
import { SITE_URL } from "@/lib/site";
import ogImageAsset from "@/assets/og-preview.jpg.asset.json";
import { HomeNav } from "@/components/home/HomeNav";
import { CustomCursor } from "@/components/home/CustomCursor";
import { HeroExperience } from "@/components/home/experience/HeroExperience";
import { Services } from "@/components/home/sections/Services";
import { EffectProcess } from "@/components/home/sections/EffectProcess";
import { SelectedWork } from "@/components/home/sections/SelectedWork";
import { WhyEcosystem } from "@/components/home/sections/WhyEcosystem";
import { Founder } from "@/components/home/sections/Founder";
import { FinalCTA } from "@/components/home/sections/FinalCTA";

const OG_IMAGE = `${SITE_URL}${ogImageAsset.url}`;
const TITLE = "The Roy Effect — Websites, AI & Automation | Stand Out Online";
const DESCRIPTION =
  "The Roy Effect builds conversion-focused websites, AI agents and business automation that turn attention into customers. Strategy, websites, AI, automation and growth — based in Houston, working nationwide.";

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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "theme-color", content: "#050505" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "stylesheet", href: homeBaseCss },
      { rel: "stylesheet", href: homeExperienceCss },
      { rel: "stylesheet", href: homeExperienceMotionCss },
      { rel: "stylesheet", href: homeSectionsCss },
      {
        rel: "preload",
        as: "image",
        href: "/brand/roy-effect-emblem-512.webp",
        type: "image/webp",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}/#business`,
          name: "The Roy Effect",
          slogan: "Stand Out Online",
          description: DESCRIPTION,
          url: SITE_URL,
          logo: `${SITE_URL}/brand/roy-effect-emblem.webp`,
          email: "rory@theroyeffect.com",
          telephone: "+1-281-323-0450",
          founder: { "@type": "Person", name: "Rory Ulloa" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Houston",
            addressRegion: "TX",
            addressCountry: "US",
          },
          areaServed: { "@type": "City", name: "Houston" },
          knowsAbout: [
            "Website design and development",
            "Conversion rate optimization",
            "AI agents",
            "Business process automation",
            "CRM and follow-up automation",
            "Lead generation",
            "Digital strategy",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main id="main" tabIndex={-1} className="home">
      {/* First focusable element: keyboard users can bypass the pinned sequence. */}
      <a href="#services" className="xp-skip">
        Skip the intro
      </a>
      <HomeNav />
      <CustomCursor />
      <HeroExperience />
      <div id="experience-end" aria-hidden="true" />
      <Services />
      <EffectProcess />
      <SelectedWork />
      <WhyEcosystem />
      <Founder />
      <FinalCTA />
    </main>
  );
}
