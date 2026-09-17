import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TextMaskReveal } from "@/components/cinematic/TextMaskReveal";
import { StickyStackCards } from "@/components/cinematic/StickyStackCards";

const PROMISE_STEPS = [
  { step: "01", title: "Design first", body: "You see the full design before a single page is built." },
  { step: "02", title: "Sign-off in writing", body: "Nothing moves to build until you've approved it." },
  { step: "03", title: "What you approved is what ships", body: "No surprises at launch. Change requests are yours to make, not mine." },
];

export function ApprovalPromise() {
  return (
    <section className="relative z-20 border-t border-white/10 bg-[#0a0620] px-5 py-20 md:px-10 md:py-28">
      <ScrollReveal className="mx-auto max-w-7xl">
        <span className="font-mono text-xs tracking-widest text-[#DFBA73]">THE APPROVAL PROMISE</span>
        <TextMaskReveal
          text="You approve the design. That design is what goes live."
          className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl"
        />
        <p className="mt-5 max-w-2xl font-mono text-base leading-[1.6] text-white/90">
          No bait-and-switch between the mockup and the build. You sign off on the design before any build work starts, and the site that launches is the one you approved. If something changes, it&apos;s because you asked for it.
        </p>
        <div className="mt-12">
          <StickyStackCards items={PROMISE_STEPS} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link to="/audit" className="inline-flex min-h-11 items-center gap-2 bg-[#FF3333] px-5 py-3 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-[#FF5555]">
            GET YOUR FREE AUDIT <ArrowUpRight className="size-4" />
          </Link>
          <a href="/#pricing" className="inline-flex min-h-11 items-center py-2 font-mono text-[15px] tracking-widest text-[#DFBA73] hover:text-white">
            SEE THE INVESTMENT →
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
