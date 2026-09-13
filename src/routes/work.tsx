import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkGrid } from "@/components/WorkGrid";

const TITLE = "Selected Work — The Roy Effect";
const DESCRIPTION = "Live client websites designed and built by Houston creative director Rory Ulloa — RV parks, hotels, contractors and local businesses across Texas and Florida.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroyeffect.com/work" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://theroyeffect.com/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main className="scene-floor min-h-screen bg-[#030014] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
      <SiteHeader />
      <div className="mx-auto max-w-7xl">
        
        <span className="font-mono text-xs tracking-widest text-[#FF3333]">WORK</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">Work built around the next action</h1>
        <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-white/60">Live websites I&apos;ve designed and built for RV parks, hotels, contractors and local businesses. Every project below is online right now — open any of them.</p>
        <div className="mt-12"><WorkGrid /></div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/audit" className="bg-[#FF3333] px-5 py-3 font-mono text-xs font-bold tracking-widest text-black">GET A FREE AUDIT</Link>
          <Link to="/book" className="border border-white/20 px-5 py-3 font-mono text-xs tracking-widest text-white">BOOK A CALL</Link>
        </div>
      </div>
    </main>
  );
}