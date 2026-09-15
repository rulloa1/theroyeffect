import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { cta } from "@/components/ui/button";
import { PROCESS_STEPS } from "@/lib/site-content";

const TITLE = "Design Process — The Roy Effect";
const DESCRIPTION = "Rory Ulloa's five-step brand, UI/UX and website process: brief, direction, design, build and post-launch support.";
export const Route = createFileRoute("/process")({
  head: () => ({ meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://www.theroyeffect.com/process" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://www.theroyeffect.com/process" }] }), component: ProcessPage,
});
function ProcessPage() { return <main className="scene-floor min-h-screen bg-[#030014] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36"><SiteHeader /><div className="mx-auto max-w-5xl"><span className="font-mono text-xs tracking-widest text-[#FF3333]">PROCESS</span><h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">From brief to launch</h1><ol className="mt-12 grid gap-4 md:grid-cols-2">{PROCESS_STEPS.map((item) => <li key={item.step} className="card-3d border border-white/10 bg-white/[0.02] p-6"><span className="font-mono text-xs text-[#FF3333]">{item.step}</span><h2 className="mt-2 font-display text-2xl uppercase text-white">{item.title}</h2><p className="mt-3 font-mono text-xs leading-relaxed text-white/60">{item.body}</p></li>)}</ol><Link to="/book" className={cta({}, "mt-10")}>BOOK A CALL</Link></div></main> }