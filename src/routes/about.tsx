import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Tilt3D } from "@/components/Tilt3D";
import portraitAsset from "@/assets/rory-portrait-clean.png.asset.json";

const TITLE = "About Rory Ulloa — Houston Creative Director";
const DESCRIPTION = "Meet Rory Ulloa, a Houston creative director, UI/UX designer and no-code developer working solo with founders and service businesses.";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "profile" }, { property: "og:url", content: "https://www.theroyeffect.com/about" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://www.theroyeffect.com/about" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="scene-floor min-h-screen overflow-hidden bg-[#030014] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
      <SiteHeader />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1fr_0.8fr] md:items-center">
          <div><span className="font-mono text-xs tracking-widest text-[#FF3333]">ABOUT</span><h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">Rory Ulloa</h1>
            <div className="mt-6 max-w-2xl space-y-4 font-mono text-sm leading-relaxed text-white/60"><p>I&apos;m a Houston-based creative director, UI/UX designer and no-code developer. I work solo, from the first audit through the finished build.</p><p>Dirt, refined into gold is a working principle: start with the unpolished offer, find what matters, and shape it into a clear brand and a site built to sell.</p><p>I design brand systems, marketing sites and product interfaces, then ship them in Webflow, Framer or TanStack. The thing you approve is the thing that goes live.</p></div>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/audit" className="inline-flex items-center bg-[#FF3333] px-5 py-3 font-mono text-xs font-bold tracking-widest text-black transition-colors duration-200 hover:bg-[#FF5555]">GET A FREE AUDIT</Link><Link to="/book" className="inline-flex items-center border border-white/20 px-5 py-3 font-mono text-xs tracking-widest text-white transition-colors duration-200 hover:border-[#DFBA73]">BOOK A CALL</Link></div>
          </div>
          <Tilt3D max={5} className="parallax-far min-h-[28rem]"><div className="relative h-full min-h-[28rem] border border-white/10 bg-white/[0.02] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"><img src={portraitAsset.url} alt="Rory Ulloa, creative director in Houston" width={896} height={1077} className="absolute inset-0 h-full w-full object-contain object-bottom grayscale contrast-125" /></div></Tilt3D>
        </div>
      </div>
    </main>
  );
}