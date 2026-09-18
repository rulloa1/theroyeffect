import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { SiteHeader, type NavTarget } from "@/components/SiteHeader";
import { HeroContent } from "@/components/HeroContent";
import { InfoDrawer } from "@/components/InfoDrawer";
import { Pricing } from "@/components/Pricing";
import { WorkGrid } from "@/components/WorkGrid";
import { ApprovalPromise } from "@/components/ApprovalPromise";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ClosingMarqueeCta } from "@/components/ClosingMarqueeCta";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Odometer } from "@/components/cinematic/Odometer";
import { DrawUnderline } from "@/components/cinematic/DrawUnderline";
import { ArrowUpRight, Check, SearchCheck, Zap, Smartphone } from "lucide-react";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";
import ogImageAsset from "@/assets/og-preview.jpg.asset.json";

const WORK_STATS = [{ value: "$2,500", label: "Starting investment" }];

const HERO_IMAGE = portraitAsset.url;
const HERO_IMAGE_ABSOLUTE = `https://theroyeffect.com${ogImageAsset.url}`;
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
      { property: "og:url", content: "https://theroyeffect.com/" },
      { property: "og:image", content: HERO_IMAGE_ABSOLUTE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMAGE_ABSOLUTE },
    ],
    links: [{ rel: "canonical", href: "https://theroyeffect.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://theroyeffect.com/#business",
          name: "The Roy Effect",
          url: "https://theroyeffect.com",
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
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<Exclude<NavTarget, "MENU"> | null>(null);
  const openDrawer = (target: NavTarget) => {
    setDrawerSection(target === "MENU" ? null : target);
    setDrawerOpen(true);
  };

  return (
    // overflow-x-clip, not -hidden: hidden makes <main> a scroll container and breaks position:sticky.
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-[#030014]">
      <ParticleBackground />
      <SiteHeader onNavigate={openDrawer} />

      <section data-home-hero className="relative min-h-[42rem] overflow-hidden md:min-h-screen">
        <HeroContent />
        <img
          src={HERO_IMAGE}
          alt="Rory Ulloa, Creative Director, UI/UX designer and no-code developer"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={896}
          height={1078}
          className="pointer-events-none absolute bottom-0 right-[-18%] z-10 h-[38%] w-auto max-w-none object-contain object-bottom opacity-40 grayscale contrast-125 sm:right-0 sm:h-[55%] sm:opacity-55 md:right-[-3%] md:h-[72%] md:opacity-70 lg:right-[2%] lg:h-[78%]"
        />
      </section>

      <section id="work" className="relative z-20 bg-[#030014] px-5 py-20 md:px-10 md:py-28">
        <ScrollReveal className="mx-auto max-w-7xl">
          <span className="font-mono text-xs tracking-widest text-[#FF3333]">SELECTED WORK</span>
          <h2 className="mt-3 font-display text-4xl uppercase text-white md:text-6xl">
            Built to make the offer clear.
          </h2>
          <dl className="mt-8 border-y border-white/10 py-6 md:max-w-sm">
            {WORK_STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="mt-2 font-mono text-[11px] uppercase tracking-widest text-white/70 md:text-xs">
                  {label}
                </dt>
                <dd className="font-display text-3xl text-white sm:text-4xl md:text-6xl">
                  <Odometer value={value} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10">
            <WorkGrid />
          </div>
        </ScrollReveal>
      </section>

      <ApprovalPromise />

      <section className="relative z-20 border-y border-white/10 bg-[#0a0620] px-5 py-20 md:px-10 md:py-28">
        <ScrollReveal className="mx-auto max-w-7xl">
          <span className="font-mono text-xs tracking-widest text-[#DFBA73]">FIT</span>
          <h2 className="mt-3 font-display text-4xl uppercase text-white md:text-6xl">
            A fit when the offer is proven.
          </h2>
          <DrawUnderline className="mt-3" />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="border-l-2 border-[#FF3333] pl-6">
              <h3 className="font-display text-2xl uppercase text-white">I take</h3>
              <p className="mt-3 max-w-lg font-mono text-base leading-[1.6] text-white/90">
                Founders, personal brands, and service businesses that already have demand and a
                weak site.
              </p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <h3 className="font-display text-2xl uppercase text-white">I pass</h3>
              <p className="mt-3 max-w-lg font-mono text-base leading-[1.6] text-white/90">
                Logo-only jobs with no strategy, 40-page brochure rebuilds on a $1,500 budget, and
                “make it pop” with no offer.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ProcessTimeline />

      <Pricing />

      <section
        id="start-here"
        className="relative z-20 w-full bg-[#030014] px-5 py-20 md:px-10 md:py-28"
      >
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <span className="font-mono text-xs tracking-widest text-[#DFBA73]">START HERE</span>
          <h2 className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.9] text-white md:text-6xl">
            Two ways to get a clear next move.
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-base leading-[1.6] text-white/90">
            Start with focused feedback, or talk through the scope directly.
          </p>

          <div className="mt-10 grid border border-white/10 md:grid-cols-2">
            <div
              id="audit"
              className="flex min-w-0 flex-col border-b border-[#FF3333]/30 bg-[#FF3333]/5 p-6 sm:p-8 md:border-b-0 md:border-r md:p-10 lg:p-12"
            >
              <span className="font-mono text-xs tracking-widest text-[#FF3333]">
                FREE VIDEO WEBSITE AUDIT
              </span>
              <h3 className="mt-3 font-display text-3xl uppercase leading-[0.95] text-white md:text-5xl">
                One minute to request. Five minutes of focused feedback.
              </h3>
              <p className="mt-4 max-w-xl font-mono text-base leading-[1.6] text-white/90">
                Submit your URL in about one minute. I&apos;ll email a personalised video teardown
                around five minutes long, covering your homepage, mobile UX and conversion flow.
              </p>
              <ul className="mt-7 divide-y divide-white/10 border-y border-white/10">
                {[
                  {
                    Icon: SearchCheck,
                    title: "Conversion audit",
                    copy: "Find the leaks in your funnel and fix your messaging.",
                  },
                  {
                    Icon: Smartphone,
                    title: "Mobile UX review",
                    copy: "See where friction kills enquiries on phones.",
                  },
                  {
                    Icon: Zap,
                    title: "Quick wins",
                    copy: "Actionable fixes you can implement this week.",
                  },
                ].map(({ Icon, title, copy }) => (
                  <li key={title} className="flex items-start gap-3 py-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-[#FF3333]" />
                    <p className="min-w-0 font-mono text-sm leading-[1.6] text-white/90">
                      <strong className="font-display text-base uppercase text-white">{title}</strong>
                      <span className="block">{copy}</span>
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                to="/audit"
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 bg-[#FF3333] px-6 py-4 font-mono text-xs font-bold tracking-widest text-black hover:bg-[#FF5555]"
              >
                GET YOUR FREE AUDIT <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div
              id="discovery-call"
              className="flex min-w-0 flex-col bg-white/[0.02] p-6 sm:p-8 md:p-10 lg:p-12"
            >
              <span className="font-mono text-xs tracking-widest text-[#DFBA73]">
                DISCOVERY CALL
              </span>
              <h3 className="mt-3 font-display text-3xl uppercase leading-[0.95] text-white md:text-5xl">
                Talk the project through.
              </h3>
              <p className="mt-4 max-w-xl font-mono text-base leading-[1.6] text-white/90">
                Bring the goal, timeline, and budget. This free 15-minute call ends with a clear
                written recommendation.
              </p>
              <ul className="mt-7 space-y-4 border border-white/10 bg-[#030014] p-5 font-mono text-base leading-[1.6] text-white/90 sm:p-6">
                {[
                  "Free 15-minute call, no pitch",
                  "Scope, timeline, budget",
                  "Leave with a written recommendation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-1 size-4 shrink-0 text-[#DFBA73]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/book"
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 border border-white/40 px-6 py-4 font-mono text-xs font-bold tracking-widest text-white hover:border-[#DFBA73]"
              >
                CHOOSE A TIME <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="relative z-20 border-t border-white/10 bg-[#0a0620] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl uppercase text-white md:text-5xl">
            Web design in Houston
          </h2>
          <p className="mt-4 max-w-3xl font-mono text-base leading-[1.6] text-white/90">
            I&apos;m based near Houston and work with founders and service businesses across the
            area on brand systems, digital product design, and conversion-focused websites.
          </p>
          <div className="mt-5 flex flex-wrap gap-5">
            <Link
              to="/guides/houston-website-cost"
              className="inline-flex min-h-11 items-center py-2 font-mono text-[15px] text-[#DFBA73] hover:text-white"
            >
              HOUSTON WEBSITE COST →
            </Link>
            <Link
              to="/guides/squarespace-vs-custom-website"
              className="inline-flex min-h-11 items-center py-2 font-mono text-[15px] text-[#DFBA73] hover:text-white"
            >
              SQUARESPACE VS CUSTOM →
            </Link>
          </div>
        </div>
      </section>

      <ClosingMarqueeCta />

      <InfoDrawer
        open={drawerOpen}
        section={drawerSection}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerSection(null);
        }}
      />
      <Toaster />
    </main>
  );
}
