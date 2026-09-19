import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ParticleBackground";
import { PortfolioHeader } from "@/components/PortfolioHeader";
import { ScrollReveal } from "@/components/ScrollReveal";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";
import { PRICING_TIERS } from "@/lib/commerce-catalog";
import { CONTACT_EMAIL, LINKEDIN_URL, RESUME_URL, SITE_URL, X_URL } from "@/lib/site";

const TITLE = "About Rory Ulloa — Houston Creative Director";
const DESCRIPTION = "Meet Rory Ulloa, a Houston creative director, UI/UX designer and no-code developer working solo with founders and service businesses.";

const SOCIAL_URLS = [LINKEDIN_URL, X_URL].filter((url): url is string => url !== null);

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rory Ulloa",
  jobTitle: "Creative Director",
  url: `${SITE_URL}/about`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Houston",
    addressRegion: "TX",
    addressCountry: "US",
  },
  worksFor: {
    "@type": "Organization",
    name: "The Roy Effect",
    url: SITE_URL,
  },
  ...(SOCIAL_URLS.length > 0 ? { sameAs: SOCIAL_URLS } : {}),
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(PERSON_SCHEMA),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background">
      <ParticleBackground />
      <PortfolioHeader />

      <section className="relative z-20 px-2 pb-2 pt-20 md:px-4 md:pb-4 md:pt-24">
        <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] max-w-[96rem] overflow-hidden border border-border bg-card lg:grid-cols-[4rem_minmax(0,1.05fr)_minmax(18rem,0.72fr)_minmax(14rem,0.55fr)]">
          <div className="order-4 flex items-center gap-2 border-t border-border px-5 py-5 lg:order-1 lg:flex-col lg:justify-center lg:border-r lg:border-t-0 lg:px-0">
            {LINKEDIN_URL ? (
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="Rory Ulloa on LinkedIn" className="inline-flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-[#DFBA73] hover:text-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]">
                <Linkedin className="size-4" aria-hidden="true" />
              </a>
            ) : null}
            {X_URL ? (
              <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Rory Ulloa on X" className="inline-flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-[#DFBA73] hover:text-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]">
                <Twitter className="size-4" aria-hidden="true" />
              </a>
            ) : null}
            <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email Rory Ulloa at ${CONTACT_EMAIL}`} className="inline-flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-[#DFBA73] hover:text-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]">
              <Mail className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative order-1 flex flex-col justify-center px-5 py-12 sm:px-8 md:px-12 lg:order-2 lg:py-20 xl:px-16">
            <div aria-hidden="true" className="portfolio-dot-grid absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#DFBA73]" aria-hidden="true" />
                <p className="font-mono text-xs font-bold tracking-widest text-[#DFBA73]">ABOUT</p>
              </div>
              <h1 className="mt-5 font-portfolio text-5xl font-bold leading-[0.9] text-foreground sm:text-6xl md:text-7xl xl:text-8xl">Rory Ulloa</h1>
              <p className="mt-6 max-w-2xl font-portfolio-body text-lg leading-relaxed text-foreground/75 md:text-xl">I transform ideas into digital experiences that look the part and ask for the sale.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-none bg-[#DFBA73] px-7 font-mono text-xs font-bold tracking-widest text-background hover:bg-[#DFBA73]/90">
                  <Link to="/book">HIRE ME <ArrowUpRight /></Link>
                </Button>
                {RESUME_URL ? (
                  <Button asChild size="lg" variant="outline" className="rounded-none border-border bg-transparent px-7 font-mono text-xs font-bold tracking-widest text-foreground hover:border-[#DFBA73] hover:bg-foreground/5">
                    <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">RESUME <ArrowUpRight /></a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative order-2 min-h-[24rem] overflow-hidden border-t border-border lg:order-3 lg:min-h-0 lg:border-l lg:border-t-0">
            <img src={portraitAsset.url} alt="Rory Ulloa, creative director in Houston" width={896} height={1078} loading="eager" decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-contain object-bottom grayscale contrast-125 lg:object-cover lg:object-[52%_center]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true" />
          </div>

          <dl className="order-3 grid divide-y divide-border border-t border-border lg:order-4 lg:flex lg:flex-col lg:justify-end lg:border-l lg:border-t-0">
            <div className="p-5 lg:p-6"><dt className="font-mono text-[10px] font-bold tracking-widest text-[#DFBA73]">BASED IN</dt><dd className="mt-2 font-portfolio text-lg font-semibold text-foreground">Houston, Texas</dd></div>
            <div className="p-5 lg:p-6"><dt className="font-mono text-[10px] font-bold tracking-widest text-[#DFBA73]">SPECIALIZING IN</dt><dd className="mt-2 font-portfolio text-lg font-semibold text-foreground">Creative development</dd></div>
            <div className="p-5 lg:p-6"><dt className="font-mono text-[10px] font-bold tracking-widest text-[#DFBA73]">FEATURED WORK</dt><dd className="mt-2"><Link to="/case-study" className="inline-flex min-h-11 items-center gap-2 font-portfolio text-lg font-semibold text-foreground transition-colors hover:text-[#DFBA73]">View case study <ArrowUpRight className="size-4" /></Link></dd></div>
          </dl>
        </div>
      </section>

      <section className="relative z-20 border-y border-border bg-card px-5 py-24 md:px-10 md:py-36">
        <ScrollReveal className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20" respectEffectsGuard>
          <div>
            <p className="font-mono text-xs font-bold tracking-widest text-[#DFBA73]">HOW I WORK</p>
            <h2 className="mt-4 font-portfolio text-5xl font-bold leading-[0.92] text-foreground md:text-7xl">One point of view, from first look to launch.</h2>
          </div>
          <div className="space-y-6 border-t border-border pt-8 font-portfolio-body text-lg leading-relaxed text-foreground/75 lg:mt-10">
            <p>I work solo from the first audit to the finished build, so the strategy, design and final experience stay connected.</p>
            <p>I design brand systems, marketing sites and product interfaces, then ship them as working digital products.</p>
            <p>You approve the design before the build begins. What you approve is what goes live.</p>
            <blockquote className="border-l-2 border-[#DFBA73] py-3 pl-6 font-portfolio text-3xl font-bold leading-tight text-foreground md:text-5xl">“Dirt, refined into gold.”</blockquote>
          </div>
        </ScrollReveal>
      </section>

      <section className="relative z-20 bg-background px-5 py-24 md:px-10 md:py-36">
        <ScrollReveal className="mx-auto max-w-7xl" respectEffectsGuard>
          <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div><p className="font-mono text-xs font-bold tracking-widest text-[#DFBA73]">WHAT I DO</p><h2 className="mt-4 font-portfolio text-5xl font-bold leading-[0.92] text-foreground md:text-7xl">Four ways to work together.</h2></div>
            <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-[#DFBA73] transition-colors hover:text-foreground">VIEW ALL PRICING <ArrowUpRight className="size-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_TIERS.map((tier, index) => (
              <article key={tier.name} className="group flex min-h-64 flex-col border-b border-border py-7 sm:border-r sm:px-6 sm:first:pl-0 lg:border-b-0 lg:last:border-r-0 lg:last:pr-0">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">0{index + 1}</span>
                <h3 className="mt-5 font-portfolio text-2xl font-bold text-foreground">{tier.name}</h3>
                <p className="mt-3 font-mono text-xs font-bold tracking-widest text-[#DFBA73]">{tier.note === "/mo" ? `${tier.price}/mo` : `${tier.note} ${tier.price}`}</p>
                <p className="mt-4 line-clamp-2 font-portfolio-body text-sm leading-relaxed text-foreground/60">{tier.description}</p>
                <Link to="/pricing" className="mt-auto inline-flex min-h-11 items-end gap-2 pt-5 font-mono text-xs font-bold tracking-widest text-foreground transition-colors group-hover:text-[#DFBA73]">VIEW PRICING <ArrowUpRight className="size-4" /></Link>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="relative z-20 overflow-hidden bg-[#DFBA73] px-5 py-24 text-background md:px-10 md:py-36">
        <div aria-hidden="true" className="absolute -right-10 -top-20 font-portfolio text-[18rem] font-bold leading-none text-background/5">R</div>
        <ScrollReveal className="relative mx-auto max-w-7xl" respectEffectsGuard>
          <p className="font-mono text-xs font-bold tracking-widest">LAST WORD</p>
          <h2 className="mt-4 max-w-5xl font-portfolio text-5xl font-bold leading-[0.9] md:text-8xl">See what your site could become.</h2>
          <div className="mt-10 flex flex-col gap-4 border-t border-background/20 pt-8 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="rounded-none bg-background px-7 font-mono text-xs font-bold tracking-widest text-foreground hover:bg-card"><Link to="/audit">GET YOUR FREE AUDIT <ArrowUpRight /></Link></Button>
            <Link to="/book" className="inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-background transition-opacity hover:opacity-60">OR BOOK A DISCOVERY CALL <ArrowUpRight className="size-4" /></Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}